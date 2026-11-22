import { auth, db, isAdminAccount } from '../lib/firebase';
import {
  addDoc, collection, deleteDoc, deleteField, doc, getDoc, getDocs, onSnapshot,
  orderBy, query, runTransaction, serverTimestamp, setDoc, updateDoc, where, writeBatch
} from 'firebase/firestore';

const DEFAULT_SETTINGS = {
  theme: 'light',
  accent: 'slate',
  density: 'comfortable',
  cardStyle: 'bordered'
};

export function generateSecureAccessCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const random = new Uint8Array(8);
  crypto.getRandomValues(random);
  const code = Array.from(random, value => chars[value % chars.length]).join('');
  return `EQ-${code.slice(0, 4)}-${code.slice(4)}`;
}

export function avatarFor(name = '?') {
  const initials = name.trim().split(/\s+/).slice(0, 2).map(word => word[0]?.toUpperCase() || '').join('') || '?';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="#475569"/><text x="48" y="60" font-family="Arial,sans-serif" font-size="38" font-weight="700" fill="#ffffff" text-anchor="middle">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const GUEST_USER = {
  id: 'guest',
  name: 'Guest',
  email: '',
  role: 'guest',
  programId: null,
  avatar: avatarFor('Guest')
};

const emptyProgramData = () => ({ periods: [], roster: [], technologies: [], projects: [] });
const failed = (error) => ({ success: false, message: error.message || 'The operation could not be completed.' });

class EquipStore {
  constructor() {
    this.subscribers = new Set();
    this.currentUser = GUEST_USER;
    this.programs = [];
    this.settings = this.readSettings();
    this.applySettings();
    this.dataError = '';
    this.programsLoading = false;
    this.rootUnsubscribers = [];
    this.detailUnsubscribers = new Map();
    this.programSources = new Map();
    this.programDetails = new Map();
    this.notify();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify() {
    this.subscribers.forEach(callback => callback());
  }

  reportError(error) {
    console.error('EQUIP data operation failed', error);
    this.dataError = error.message || 'The operation could not be completed.';
    this.notify();
  }

  getDataError() {
    return this.dataError;
  }

  clearDataError() {
    this.dataError = '';
    this.notify();
  }

  async perform(operation) {
    this.clearDataError();
    try {
      return await operation();
    } catch (error) {
      this.reportError(error);
      return failed(error);
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  setCurrentUser(user) {
    const nextUser = user || GUEST_USER;
    const identityChanged = this.currentUser.id !== nextUser.id
      || this.currentUser.role !== nextUser.role
      || this.currentUser.programId !== nextUser.programId;
    this.currentUser = nextUser;
    if (identityChanged) this.connectProgramFeeds();
    this.notify();
  }

  signOut() {
    this.setCurrentUser(GUEST_USER);
  }

  connectProgramFeeds() {
    this.rootUnsubscribers.forEach(unsubscribe => unsubscribe());
    this.detailUnsubscribers.forEach(unsubscribeList => unsubscribeList.forEach(unsubscribe => unsubscribe()));
    this.rootUnsubscribers = [];
    this.detailUnsubscribers.clear();
    this.programSources.clear();
    this.programDetails.clear();
    this.programs = [];
    if (!db) {
      this.programsLoading = false;
      this.notify();
      return;
    }
    this.programsLoading = true;

    const user = this.currentUser;
    const sources = [];
    sources.push(['public', query(collection(db, 'programs'), where('status', '==', 'approved'))]);
    if (isAdminAccount(auth?.currentUser)) {
      sources.push(['all', collection(db, 'programs')]);
    } else if (user.role === 'facilitator') {
      sources.push(['owned', query(collection(db, 'programs'), where('facilitatorId', '==', user.id))]);
    }

    sources.forEach(([key, sourceQuery]) => {
      const unsubscribe = onSnapshot(sourceQuery, snapshot => {
        this.programSources.set(key, snapshot.docs.map(item => ({ id: item.id, ...item.data() })));
        this.programsLoading = false;
        this.mergeProgramSources();
      }, error => {
        this.programsLoading = false;
        this.reportError(error);
      });
      this.rootUnsubscribers.push(unsubscribe);
    });
  }

  mergeProgramSources() {
    const merged = new Map();
    this.programSources.forEach(programs => programs.forEach(program => {
      const details = this.programDetails.get(program.id) || {};
      const projects = [
        ...(details.projects || []),
        ...(details.projects_approved || []),
        ...(details.projects_own || [])
      ];
      merged.set(program.id, {
        ...emptyProgramData(),
        ...program,
        ...details,
        projects: Array.from(new Map(projects.map(project => [project.id, project])).values())
      });
    }));
    this.programs = Array.from(merged.values());
    const visibleOwnedProgram = this.programs.find(program => program.facilitatorId === this.currentUser.id);
    if (visibleOwnedProgram) this.loadProgramDetails(visibleOwnedProgram.id);
    if (this.currentUser.programId && merged.has(this.currentUser.programId)) {
      this.loadProgramDetails(this.currentUser.programId);
    }
    this.notify();
  }

  getPrograms() {
    return this.programs;
  }

  isLoadingPrograms() {
    return this.programsLoading;
  }

  getProgram(id) {
    return this.programs.find(program => program.id === id) || null;
  }

  loadProgramDetails(programId) {
    if (!db || this.detailUnsubscribers.has(programId)) return;
    const program = this.getProgram(programId);
    if (!program) return;

    const isAdmin = isAdminAccount(auth?.currentUser);
    const isOwner = program.facilitatorId === this.currentUser.id;
    const isMember = this.currentUser.programId === programId;
    const isPublic = program.status === 'approved';
    const canReadWorkspace = isAdmin || isOwner;
    const subscriptions = [];
    const listen = (key, source) => subscriptions.push(onSnapshot(source, snapshot => {
      const current = this.programDetails.get(programId) || emptyProgramData();
      const value = snapshot.docs
        ? snapshot.docs.map(item => ({ id: item.id, ...item.data() }))
        : snapshot.exists()
          ? { id: snapshot.id, ...snapshot.data() }
          : null;
      this.programDetails.set(programId, {
        ...current,
        [key]: key === 'code' ? value?.code || '' : Array.isArray(value) ? value : value ? [value] : []
      });
      this.mergeProgramSources();
    }, error => this.reportError(error)));
    const base = (name) => collection(db, 'programs', programId, name);

    if (canReadWorkspace) {
      listen('code', doc(db, 'programJoinCodeRecords', programId));
      listen('periods', query(base('periods'), orderBy('name')));
      listen('roster', query(base('roster'), orderBy('name')));
      listen('technologies', query(base('technologies'), orderBy('name')));
      listen('projects', query(base('projects'), orderBy('submissionDate', 'desc')));
    } else if (isMember) {
      listen('roster', doc(db, 'programs', programId, 'roster', this.currentUser.id));
    }
    if (isMember && !canReadWorkspace) {
      listen('periods', query(base('periods'), orderBy('name')));
      listen('technologies', query(base('technologies'), orderBy('name')));
      const approved = query(base('projects'), where('status', '==', 'approved'));
      const own = query(base('projects'), where('createdByUid', '==', this.currentUser.id));
      listen('projects_approved', approved);
      listen('projects_own', own);
    } else if (isPublic && !canReadWorkspace) {
      if (program.showTechnologyPublicly) listen('technologies', query(base('technologies'), orderBy('name')));
      if (program.showProjectsPublicly) listen('projects_approved', query(base('projects'), where('status', '==', 'approved')));
    }
    this.detailUnsubscribers.set(programId, subscriptions);
  }

  async createProgram(input, facilitatorUser) {
    return this.perform(async () => {
      if (!db) throw new Error('Firebase Firestore is not configured.');
      const programRef = doc(collection(db, 'programs'));
      const profileRef = doc(db, 'users', facilitatorUser.id);
      const code = generateSecureAccessCode();
      const batch = writeBatch(db);
      batch.set(programRef, {
        name: input.name.trim(),
        status: 'draft',
        facilitatorId: facilitatorUser.id,
        location: input.location || '',
        campusRoomNumber: input.campusRoomNumber || '',
        description: input.description || '',
        photo: input.photo || '',
        showTechnologyPublicly: !!input.showTechnologyPublicly,
        showProjectsPublicly: !!input.showProjectsPublicly,
        facilitator: {
          id: facilitatorUser.id,
          name: facilitatorUser.name,
          title: 'EAST Facilitator',
          email: input.facilitatorEmail || facilitatorUser.email,
          phone: input.facilitatorPhone || '',
          officeHours: input.facilitatorOfficeHours || '',
          avatar: facilitatorUser.avatar || '',
          status: 'approved'
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      batch.set(doc(db, 'programJoinCodeRecords', programRef.id), {
        programId: programRef.id,
        code,
        updatedAt: serverTimestamp()
      });
      batch.set(doc(db, 'programCodeIndex', code), { programId: programRef.id, code });
      batch.update(profileRef, { programId: programRef.id, updatedAt: serverTimestamp() });
      await batch.commit();
      this.setCurrentUser({ ...this.currentUser, programId: programRef.id });
      return { id: programRef.id, ...input, code, status: 'draft', facilitatorId: facilitatorUser.id, ...emptyProgramData() };
    });
  }

  async updateProgram(programId, updates) {
    return this.perform(async () => {
      const patch = { ...updates, updatedAt: serverTimestamp() };
      await setDoc(doc(db, 'programs', programId), patch, { merge: true });
      return { success: true };
    });
  }

  async approveProgram(programId) {
    return this.perform(async () => {
      await updateDoc(doc(db, 'programs', programId), { status: 'approved', updatedAt: serverTimestamp() });
      return { success: true };
    });
  }

  async regenerateProgramCode(programId) {
    return this.perform(async () => {
      const code = generateSecureAccessCode();
      await runTransaction(db, async transaction => {
        const recordRef = doc(db, 'programJoinCodeRecords', programId);
        const record = await transaction.get(recordRef);
        if (!record.exists()) throw new Error('The program access code could not be found.');
        const previousCode = record.data().code;
        const newCodeRef = doc(db, 'programCodeIndex', code);
        const existingCode = await transaction.get(newCodeRef);
        if (existingCode.exists()) throw new Error('A code collision occurred. Please try again.');
        transaction.delete(doc(db, 'programCodeIndex', previousCode));
        transaction.set(newCodeRef, { programId, code });
        transaction.update(recordRef, { code, updatedAt: serverTimestamp() });
      });
      return code;
    });
  }

  readSettings() {
    try {
      const saved = localStorage.getItem('equip_settings_v1');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  getSettings() {
    return this.settings;
  }

  updateSettings(updates) {
    this.settings = { ...this.settings, ...updates };
    localStorage.setItem('equip_settings_v1', JSON.stringify(this.settings));
    this.applySettings(this.settings);
    this.notify();
    return this.settings;
  }

  applySettings(settings = this.settings) {
    const root = document.documentElement;
    root.setAttribute('data-theme', settings.theme || 'light');
    root.setAttribute('data-accent', settings.accent || 'slate');
    root.setAttribute('data-density', settings.density || 'comfortable');
    root.setAttribute('data-card-style', settings.cardStyle || 'bordered');
  }

  async joinProgramByCode(code, studentUser) {
    return this.perform(async () => {
      if (!db) throw new Error('Firebase Firestore is not configured.');
      if (studentUser.role !== 'student') throw new Error('Only student accounts can join a program.');
      const cleanCode = code.trim().toUpperCase();
      const codeSnapshot = await getDoc(doc(db, 'programCodeIndex', cleanCode));
      if (!codeSnapshot.exists()) throw new Error('Invalid or unknown EAST Program Access Code.');
      const targetId = codeSnapshot.data().programId;
      const targetSnapshot = await getDoc(doc(db, 'programs', targetId));
      if (!targetSnapshot.exists() || targetSnapshot.data().status !== 'approved') {
        throw new Error('Invalid or unknown EAST Program Access Code.');
      }
      const batch = writeBatch(db);
      const rosterRef = doc(db, 'programs', targetId, 'roster', studentUser.id);
      const membership = await getDoc(rosterRef);
      if (!membership.exists()) {
        batch.set(rosterRef, {
          studentId: studentUser.id,
          name: studentUser.name,
          email: studentUser.email,
          grade: studentUser.grade || '',
          avatar: studentUser.avatar || avatarFor(studentUser.name),
          joinedAt: new Date().toISOString(),
          periodId: null,
          programId: targetId,
          accessCode: cleanCode
        });
      }
      batch.update(doc(db, 'users', studentUser.id), { programId: targetId, updatedAt: serverTimestamp() });
      if (studentUser.programId && studentUser.programId !== targetId) {
        batch.delete(doc(db, 'programs', studentUser.programId, 'roster', studentUser.id));
      }
      await batch.commit();
      this.setCurrentUser({ ...studentUser, programId: targetId });
      return { success: true, program: { id: targetId, ...targetSnapshot.data() } };
    });
  }

  async addPeriod(programId, name) {
    return this.perform(async () => {
      const clean = name.trim();
      if (!clean) throw new Error('Enter a period name.');
      const existing = this.getProgram(programId)?.periods || [];
      if (existing.some(period => period.name.toLowerCase() === clean.toLowerCase())) throw new Error('That period already exists.');
      const ref = await addDoc(collection(db, 'programs', programId, 'periods'), { name: clean, createdAt: serverTimestamp() });
      return { success: true, period: { id: ref.id, name: clean } };
    });
  }

  async renamePeriod(programId, periodId, name) {
    return this.perform(async () => {
      const clean = name.trim();
      const existing = this.getProgram(programId)?.periods || [];
      if (!clean) throw new Error('Enter a period name.');
      if (existing.some(period => period.id !== periodId && period.name.toLowerCase() === clean.toLowerCase())) throw new Error('That period already exists.');
      await updateDoc(doc(db, 'programs', programId, 'periods', periodId), { name: clean });
      return { success: true };
    });
  }

  async deletePeriod(programId, periodId) {
    return this.perform(async () => {
      const periodRoster = await getDocs(query(collection(db, 'programs', programId, 'roster'), where('periodId', '==', periodId)));
      const periodProjects = await getDocs(query(collection(db, 'programs', programId, 'projects'), where('periodIds', 'array-contains', periodId)));
      const operations = [
        ...periodRoster.docs.map(item => ({ type: 'update', ref: item.ref, data: { periodId: null } })),
        ...periodProjects.docs.map(item => ({
          type: 'update',
          ref: item.ref,
          data: { periodIds: item.data().periodIds.filter(id => id !== periodId) }
        })),
        { type: 'delete', ref: doc(db, 'programs', programId, 'periods', periodId) }
      ];
      for (let index = 0; index < operations.length; index += 450) {
        const batch = writeBatch(db);
        operations.slice(index, index + 450).forEach(operation => {
          if (operation.type === 'delete') batch.delete(operation.ref);
          else batch.update(operation.ref, operation.data);
        });
        await batch.commit();
      }
      return { success: true };
    });
  }

  async setStudentPeriod(programId, studentId, periodId) {
    return this.perform(() => updateDoc(doc(db, 'programs', programId, 'roster', studentId), { periodId: periodId || null }));
  }

  async removeStudentFromRoster(programId, studentId) {
    return this.perform(async () => {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'programs', programId, 'roster', studentId));
      batch.update(doc(db, 'users', studentId), { programId: null, updatedAt: serverTimestamp() });
      await batch.commit();
      return { success: true };
    });
  }

  async setProjectPeriods(programId, projectId, periodIds) {
    return this.perform(() => updateDoc(doc(db, 'programs', programId, 'projects', projectId), { periodIds: periodIds || [] }));
  }

  async addTechnology(programId, input) {
    return this.perform(async () => {
      const today = new Date().toISOString().split('T')[0];
      const reference = await addDoc(collection(db, 'programs', programId, 'technologies'), {
        programId, name: input.name, category: input.category || 'General Technology',
        status: input.status || 'working', assetNumber: input.assetNumber || '',
        photo: input.photo || '', note: input.note || '', hasSensitiveData: !!input.hasSensitiveData,
        dataLocation: input.dataLocation || 'None', manualUrl: input.manualUrl || '',
        dateAdded: today, lastChecked: today
      });
      return { id: reference.id, ...input };
    });
  }

  async updateTechnology(programId, techId, updates) {
    return this.perform(() => updateDoc(doc(db, 'programs', programId, 'technologies', techId), {
      ...updates, lastChecked: new Date().toISOString().split('T')[0]
    }));
  }

  async deleteTechnology(programId, techId) {
    return this.perform(() => deleteDoc(doc(db, 'programs', programId, 'technologies', techId)));
  }

  async addProject(programId, input, studentUser) {
    return this.perform(async () => {
      const program = this.getProgram(programId);
      const roster = Array.isArray(program?.roster) ? program.roster : [];
      const rosterEntry = roster.find(student => student.studentId === studentUser.id);
      const project = {
        programId, createdByUid: studentUser.id, name: input.name, status: 'draft',
        submittedBy: studentUser.name || 'EAST Student',
        submissionDate: new Date().toISOString().split('T')[0], approvedDate: null,
        category: input.category || 'Community Project', description: input.description || '',
        photos: input.photos || [],
        teamMembers: input.teamMembers || [{ name: studentUser.name || 'Team Lead', role: 'Project Coordinator', grade: studentUser.grade || 'Student' }],
        pastProjectHandlers: input.pastProjectHandlers || [], communicationLogs: input.communicationLogs || [],
        externalLinks: input.externalLinks || [], periodIds: rosterEntry?.periodId ? [rosterEntry.periodId] : []
      };
      const reference = await addDoc(collection(db, 'programs', programId, 'projects'), project);
      return { id: reference.id, ...project };
    });
  }

  async reviseProject(programId, projectId, input, studentUser) {
    return this.perform(async () => {
      if (studentUser.role !== 'student') throw new Error('Only students can revise their project submissions.');
      await updateDoc(doc(db, 'programs', programId, 'projects', projectId), {
        name: input.name.trim(),
        category: input.category || 'Community Project',
        description: input.description || '',
        photos: input.photos || [],
        teamMembers: input.teamMembers || [],
        pastProjectHandlers: input.pastProjectHandlers || [],
        communicationLogs: input.communicationLogs || [],
        externalLinks: input.externalLinks || [],
        status: 'draft',
        submissionDate: new Date().toISOString().split('T')[0],
        approvedDate: null,
        facilitatorFeedback: deleteField()
      });
      return { id: projectId };
    });
  }

  async approveProject(programId, projectId) {
    return this.perform(() => updateDoc(doc(db, 'programs', programId, 'projects', projectId), {
      status: 'approved', approvedDate: new Date().toISOString().split('T')[0]
    }));
  }

  async rejectProject(programId, projectId, reason = '') {
    return this.perform(() => updateDoc(doc(db, 'programs', programId, 'projects', projectId), {
      status: 'needs-revisions',
      facilitatorFeedback: reason || 'Please revise team roles and attach client communication log.'
    }));
  }
}

export const equipStore = new EquipStore();
