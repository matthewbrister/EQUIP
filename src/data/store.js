// Store for EQUIP application with LocalStorage persistence and reactive notifications
import { INITIAL_PROGRAMS, INITIAL_FACILITATOR_REQUESTS, DEMO_USERS } from './mockData';

const STORAGE_KEYS = {
  PROGRAMS: 'equip_programs_v1',
  FACILITATOR_REQUESTS: 'equip_fac_requests_v1',
  CURRENT_USER: 'equip_current_user_v1',
  SETTINGS: 'equip_settings_v1',
  ACCOUNTS: 'equip_accounts_v1'
};

const DEFAULT_SETTINGS = {
  theme: 'light', // 'light' | 'dark'
  accent: 'slate', // 'blue' | 'slate' | 'teal' | 'indigo'
  density: 'comfortable', // 'comfortable' | 'compact'
  cardStyle: 'bordered' // 'bordered' | 'flat'
};

// Cryptographically robust, brute-force resistant access code generator
// 32-character alphabet excludes ambiguous glyphs (0, O, 1, I)
// 32^8 = 1.09 trillion possibilities
export function generateSecureAccessCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let p1 = '';
  let p2 = '';
  for (let i = 0; i < 4; i++) {
    p1 += chars[Math.floor(Math.random() * chars.length)];
    p2 += chars[Math.floor(Math.random() * chars.length)];
  }
  return `EQ-${p1}-${p2}`;
}

// Initials avatar (inline SVG) for accounts created on this site
export function avatarFor(name = '?') {
  const initials = name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('') || '?';
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

// NOTE: front-end mock. "Sign in with Google" is simulated: accounts live in this
// browser's localStorage. Swap the signInWithGoogle / createAccountFromGoogle
// methods for real Google OAuth + a backend when the project goes live.
const fail = (message) => ({ success: false, message });

class EquipStore {
  constructor() {
    this.subscribers = new Set();
    this.initData();
  }

  initData() {
    try {
      const storedPrograms = localStorage.getItem(STORAGE_KEYS.PROGRAMS);
      if (!storedPrograms) {
        localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(INITIAL_PROGRAMS));
      } else {
        // Upgrade any old short codes to secure brute-force resistant codes
        const progs = JSON.parse(storedPrograms);
        let changed = false;

        // Make sure every program has class periods and a roster
        progs.forEach(p => {
          const seed = INITIAL_PROGRAMS.find(s => s.id === p.id);
          if (!p.periods) {
            p.periods = seed?.periods ? JSON.parse(JSON.stringify(seed.periods)) : [];
            changed = true;
          }
          if (!p.roster) {
            p.roster = seed?.roster ? JSON.parse(JSON.stringify(seed.roster)) : [];
            changed = true;
          }
        });

        // Add any newly shipped sample programs missing from saved data
        INITIAL_PROGRAMS.forEach(seed => {
          if (!progs.some(p => p.id === seed.id)) {
            progs.push(seed);
            changed = true;
          }
        });
        progs.forEach(p => {
          if (!p.code || !p.code.startsWith('EQ-') || p.code.length < 10) {
            p.code = generateSecureAccessCode();
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(progs));
        }
      }

      const storedRequests = localStorage.getItem(STORAGE_KEYS.FACILITATOR_REQUESTS);
      if (!storedRequests) {
        localStorage.setItem(STORAGE_KEYS.FACILITATOR_REQUESTS, JSON.stringify(INITIAL_FACILITATOR_REQUESTS));
      }

      const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (!storedUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(GUEST_USER));
      }

      // Initialize and apply theme & layout settings
      this.applySettings();
    } catch (e) {
      console.warn("Storage access failed, using memory fallback", e);
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify() {
    this.subscribers.forEach(cb => {
      try {
        cb();
      } catch (err) {
        console.error("Subscriber notification error", err);
      }
    });
  }

  // --- Current User & Role Management ---
  getCurrentUser() {
    try {
      const u = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return u ? JSON.parse(u) : GUEST_USER;
    } catch {
      return GUEST_USER;
    }
  }

  setCurrentUser(user) {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      this.syncAccount(user);
      this.notify();
    } catch (e) {
      console.error(e);
    }
  }

  // Keep the saved account in step with the signed-in user (programId, status, etc.)
  syncAccount(user) {
    if (!user?.id) return;
    const accounts = this.getAccounts();
    const i = accounts.findIndex(a => a.id === user.id);
    if (i < 0) return;
    accounts[i] = { ...accounts[i], ...user };
    this.saveAccounts(accounts);
  }

  switchRole(roleKey) {
    let user = DEMO_USERS[roleKey];
    if (!user) return;
    // Reflect manager approval of the pending demo facilitator
    if (user.role === 'facilitator' && user.facilitatorStatus === 'pending') {
      const req = this.getFacilitatorRequests().find(r => r.id === user.id);
      if (req?.status === 'approved') user = { ...user, facilitatorStatus: 'approved' };
    }
    this.setCurrentUser(user);
  }

  // --- Accounts & Authentication (front-end demo; see note above) ---
  getAccounts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveAccounts(list) {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(list));
  }

  findAccountByEmail(email) {
    const clean = (email || '').trim().toLowerCase();
    return this.getAccounts().find(a => a.email === clean) || null;
  }

  // Mock Google sign-in for an existing account
  signInWithGoogle(profile) {
    const account = this.findAccountByEmail(profile?.email);
    if (!account) return fail('No account found for that Google account.');
    this.setCurrentUser(account);
    return { success: true, user: account };
  }

  // Mock account creation from a Google profile + the setup answers
  createAccountFromGoogle({ profile, role, grade }) {
    if (!profile?.email) return fail('Missing Google profile.');
    if (!['student', 'facilitator'].includes(role)) return fail('Please choose an account type.');
    if (role === 'student' && !grade) return fail('Please choose your grade.');

    const email = profile.email.trim().toLowerCase();
    if (this.findAccountByEmail(email)) return fail('An account already exists for that Google account.');

    const name = `${profile.firstName} ${profile.lastName}`.trim();
    const id = `${role === 'student' ? 'stud' : 'fac'}-${Date.now()}`;
    const base = {
      id,
      name,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email,
      role,
      programId: null,
      avatar: profile.picture || avatarFor(name),
      authProvider: 'google',
      createdAt: new Date().toISOString()
    };
    const user = role === 'student'
      ? { ...base, grade }
      : { ...base, facilitatorStatus: 'pending', school: email.split('@')[1] || '' };

    const accounts = this.getAccounts();
    accounts.push(user);
    this.saveAccounts(accounts);

    if (role === 'facilitator') {
      const requests = this.getFacilitatorRequests();
      requests.unshift({
        id,
        name,
        email,
        school: user.school || 'Not provided',
        role: 'EAST Facilitator Candidate',
        googleAuthId: `mock-google|${id}`,
        submittedAt: new Date().toISOString(),
        status: 'pending',
        notes: 'Signed up with Google. Verify against the school faculty directory before approving.'
      });
      localStorage.setItem(STORAGE_KEYS.FACILITATOR_REQUESTS, JSON.stringify(requests));
    }

    this.setCurrentUser(user);
    return { success: true, user };
  }

  signOut() {
    this.setCurrentUser(GUEST_USER);
  }

  // --- Program Management ---
  getPrograms() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROGRAMS);
      return data ? JSON.parse(data) : INITIAL_PROGRAMS;
    } catch {
      return INITIAL_PROGRAMS;
    }
  }

  getProgram(id) {
    const list = this.getPrograms();
    return list.find(p => p.id === id) || null;
  }

  getProgramByCode(code) {
    if (!code) return null;
    const cleanCode = code.trim().toUpperCase();
    const list = this.getPrograms();
    return list.find(p => p.code.toUpperCase() === cleanCode) || null;
  }

  createProgram(programInput, facilitatorUser) {
    const programs = this.getPrograms();

    // Generate secure brute-force resistant access code
    const randomCode = generateSecureAccessCode();
    const newId = `prog-${Date.now()}`;

    const newProgram = {
      id: newId,
      name: programInput.name,
      code: randomCode,
      status: 'draft', // DRAFT until approved by website managers!
      location: programInput.location || 'Arkansas, United States',
      campusRoomNumber: programInput.campusRoomNumber || 'Innovation Room 101',
      description: programInput.description || '',
      photo: programInput.photo || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80',
      facilitator: {
        id: facilitatorUser.id || `fac-${Date.now()}`,
        name: facilitatorUser.name || 'Facilitator',
        title: 'EAST Facilitator',
        email: facilitatorUser.email || programInput.facilitatorEmail,
        phone: programInput.facilitatorPhone || '(555) 000-0000',
        officeHours: programInput.facilitatorOfficeHours || 'Mon-Fri 8:00 AM - 4:00 PM',
        avatar: facilitatorUser.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
        status: 'approved'
      },
      showTechnologyPublicly: !!programInput.showTechnologyPublicly,
      showProjectsPublicly: !!programInput.showProjectsPublicly,
      periods: [],
      roster: [],
      technologies: [],
      projects: []
    };

    programs.unshift(newProgram);
    localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));

    // Update current user's linked program
    const currentUser = this.getCurrentUser();
    if (currentUser.role === 'facilitator') {
      currentUser.programId = newId;
      this.setCurrentUser(currentUser);
    }

    this.notify();
    return newProgram;
  }

  updateProgram(programId, updates) {
    const programs = this.getPrograms().map(p => {
      if (p.id === programId) {
        return {
          ...p,
          ...updates,
          facilitator: {
            ...p.facilitator,
            ...(updates.facilitator || {})
          }
        };
      }
      return p;
    });
    localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));
    this.notify();
  }

  approveProgram(programId) {
    this.updateProgram(programId, { status: 'approved' });
  }

  regenerateProgramCode(programId) {
    const newCode = generateSecureAccessCode();
    this.updateProgram(programId, { code: newCode });
    return newCode;
  }

  // --- Settings & Layout Management ---
  getSettings() {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return s ? { ...DEFAULT_SETTINGS, ...JSON.parse(s) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  updateSettings(updates) {
    try {
      const current = this.getSettings();
      const updated = { ...current, ...updates };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      this.applySettings(updated);
      this.notify();
      return updated;
    } catch (e) {
      console.error("Error saving settings", e);
      return DEFAULT_SETTINGS;
    }
  }

  applySettings(settings) {
    const s = settings || this.getSettings();
    const root = document.documentElement;
    root.setAttribute('data-theme', s.theme || 'light');
    root.setAttribute('data-accent', s.accent || 'slate');
    root.setAttribute('data-density', s.density || 'comfortable');
    root.setAttribute('data-card-style', s.cardStyle || 'bordered');
  }

  // --- Student Join Program ---
  joinProgramByCode(code, studentUser) {
    const program = this.getProgramByCode(code);
    if (!program) {
      return { success: false, message: 'Invalid or unknown EAST Program Access Code.' };
    }
    if (studentUser?.role !== 'student') {
      return { success: false, message: 'Only student accounts can join a program roster.' };
    }

    const programs = this.getPrograms();

    // A student belongs to one program: leave any previous roster
    programs.forEach(p => {
      if (p.id !== program.id && p.roster) {
        p.roster = p.roster.filter(r => r.studentId !== studentUser.id);
      }
    });

    const target = programs.find(p => p.id === program.id);
    target.roster = target.roster || [];
    if (!target.roster.some(r => r.studentId === studentUser.id)) {
      target.roster.push({
        studentId: studentUser.id,
        name: studentUser.name,
        email: studentUser.email,
        grade: studentUser.grade || '',
        joinedAt: new Date().toISOString(),
        periodId: null
      });
    }
    localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));

    this.setCurrentUser({ ...studentUser, programId: program.id });
    return { success: true, program: target };
  }

  // --- Class Periods & Roster (facilitator tools) ---
  mutateProgram(programId, fn) {
    const programs = this.getPrograms();
    const program = programs.find(p => p.id === programId);
    if (!program) return null;
    const result = fn(program);
    localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));
    this.notify();
    return result ?? true;
  }

  addPeriod(programId, name) {
    const clean = (name || '').trim();
    if (!clean) return fail('Enter a period name.');
    return this.mutateProgram(programId, p => {
      p.periods = p.periods || [];
      if (p.periods.some(x => x.name.toLowerCase() === clean.toLowerCase())) {
        return fail('That period already exists.');
      }
      const period = { id: `per-${Date.now()}-${Math.floor(Math.random() * 1000)}`, name: clean };
      p.periods.push(period);
      return { success: true, period };
    }) || fail('Program not found.');
  }

  renamePeriod(programId, periodId, name) {
    const clean = (name || '').trim();
    if (!clean) return fail('Enter a period name.');
    return this.mutateProgram(programId, p => {
      p.periods = p.periods || [];
      if (p.periods.some(x => x.id !== periodId && x.name.toLowerCase() === clean.toLowerCase())) {
        return fail('That period already exists.');
      }
      p.periods = p.periods.map(x => (x.id === periodId ? { ...x, name: clean } : x));
      return { success: true };
    }) || fail('Program not found.');
  }

  deletePeriod(programId, periodId) {
    this.mutateProgram(programId, p => {
      p.periods = (p.periods || []).filter(x => x.id !== periodId);
      p.roster = (p.roster || []).map(r => (r.periodId === periodId ? { ...r, periodId: null } : r));
      p.projects = (p.projects || []).map(pr => ({
        ...pr,
        periodIds: (pr.periodIds || []).filter(id => id !== periodId)
      }));
    });
  }

  setStudentPeriod(programId, studentId, periodId) {
    this.mutateProgram(programId, p => {
      p.roster = (p.roster || []).map(r => (r.studentId === studentId ? { ...r, periodId: periodId || null } : r));
    });
  }

  removeStudentFromRoster(programId, studentId) {
    this.mutateProgram(programId, p => {
      p.roster = (p.roster || []).filter(r => r.studentId !== studentId);
    });
    // Send the student back to the code screen next time they sign in
    const accounts = this.getAccounts();
    const i = accounts.findIndex(a => a.id === studentId);
    if (i >= 0) {
      accounts[i] = { ...accounts[i], programId: null };
      this.saveAccounts(accounts);
    }
    const cu = this.getCurrentUser();
    if (cu.id === studentId) this.setCurrentUser({ ...cu, programId: null });
  }

  setProjectPeriods(programId, projectId, periodIds) {
    this.mutateProgram(programId, p => {
      p.projects = (p.projects || []).map(pr => (pr.id === projectId ? { ...pr, periodIds: periodIds || [] } : pr));
    });
  }

  // --- Technology Inventory Management ---
  addTechnology(programId, techInput) {
    const programs = this.getPrograms();
    const program = programs.find(p => p.id === programId);
    if (!program) return null;

    const newTech = {
      id: `tech-${Date.now()}`,
      name: techInput.name,
      category: techInput.category || 'General Technology',
      status: techInput.status || 'working', // 'working' | 'needs-repairs' | 'maintenance' | 'offline'
      assetNumber: techInput.assetNumber || `ASSET-${Math.floor(100 + Math.random() * 900)}`,
      photo: techInput.photo || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
      note: techInput.note || '',
      hasSensitiveData: !!techInput.hasSensitiveData,
      dataLocation: techInput.dataLocation || (techInput.hasSensitiveData ? 'Local storage / Internal drive' : 'None'),
      manualUrl: techInput.manualUrl || '',
      dateAdded: new Date().toISOString().split('T')[0],
      lastChecked: new Date().toISOString().split('T')[0]
    };

    program.technologies = program.technologies || [];
    program.technologies.unshift(newTech);

    localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));
    this.notify();
    return newTech;
  }

  updateTechnology(programId, techId, updates) {
    const programs = this.getPrograms();
    const program = programs.find(p => p.id === programId);
    if (!program || !program.technologies) return;

    program.technologies = program.technologies.map(t => {
      if (t.id === techId) {
        return { ...t, ...updates, lastChecked: new Date().toISOString().split('T')[0] };
      }
      return t;
    });

    localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));
    this.notify();
  }

  deleteTechnology(programId, techId) {
    const programs = this.getPrograms();
    const program = programs.find(p => p.id === programId);
    if (!program || !program.technologies) return;

    program.technologies = program.technologies.filter(t => t.id !== techId);
    localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));
    this.notify();
  }

  // --- Student Projects Management & Facilitator Approval Queue ---
  addProject(programId, projectInput, studentUser) {
    const programs = this.getPrograms();
    const program = programs.find(p => p.id === programId);
    if (!program) return null;

    const rosterEntry = (program.roster || []).find(r => r.studentId === studentUser.id);

    const newProject = {
      id: `proj-${Date.now()}`,
      periodIds: rosterEntry?.periodId ? [rosterEntry.periodId] : [],
      name: projectInput.name,
      status: 'draft', // Saved as DRAFT until facilitator approves!
      submittedBy: studentUser.name || 'EAST Student',
      submissionDate: new Date().toISOString().split('T')[0],
      approvedDate: null,
      category: projectInput.category || 'Community Project',
      description: projectInput.description || '',
      photos: projectInput.photos && projectInput.photos.length > 0 ? projectInput.photos : [
        'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80'
      ],
      teamMembers: projectInput.teamMembers && projectInput.teamMembers.length > 0 ? projectInput.teamMembers : [
        { name: studentUser.name || 'Team Lead', role: 'Project Coordinator', grade: studentUser.grade || 'Student' }
      ],
      pastProjectHandlers: projectInput.pastProjectHandlers || [],
      communicationLogs: projectInput.communicationLogs || [],
      externalLinks: projectInput.externalLinks || []
    };

    program.projects = program.projects || [];
    program.projects.unshift(newProject);

    localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));
    this.notify();
    return newProject;
  }

  approveProject(programId, projectId) {
    const programs = this.getPrograms();
    const program = programs.find(p => p.id === programId);
    if (!program || !program.projects) return;

    program.projects = program.projects.map(pr => {
      if (pr.id === projectId) {
        return {
          ...pr,
          status: 'approved',
          approvedDate: new Date().toISOString().split('T')[0]
        };
      }
      return pr;
    });

    localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));
    this.notify();
  }

  rejectProject(programId, projectId, reason = '') {
    const programs = this.getPrograms();
    const program = programs.find(p => p.id === programId);
    if (!program || !program.projects) return;

    program.projects = program.projects.map(pr => {
      if (pr.id === projectId) {
        return {
          ...pr,
          status: 'needs-revisions',
          facilitatorFeedback: reason || 'Please revise team roles and attach client communication log.'
        };
      }
      return pr;
    });

    localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));
    this.notify();
  }

  // --- Manager Portal & Facilitator Requests ---
  getFacilitatorRequests() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FACILITATOR_REQUESTS);
      return data ? JSON.parse(data) : INITIAL_FACILITATOR_REQUESTS;
    } catch {
      return INITIAL_FACILITATOR_REQUESTS;
    }
  }

  approveFacilitatorRequest(requestId) {
    const list = this.getFacilitatorRequests().map(req => {
      if (req.id === requestId) {
        return { ...req, status: 'approved' };
      }
      return req;
    });
    localStorage.setItem(STORAGE_KEYS.FACILITATOR_REQUESTS, JSON.stringify(list));

    // Unlock the matching account, and the signed-in user if it is them
    const accounts = this.getAccounts();
    const i = accounts.findIndex(a => a.id === requestId);
    if (i >= 0) {
      accounts[i] = { ...accounts[i], facilitatorStatus: 'approved' };
      this.saveAccounts(accounts);
    }
    const currentUser = this.getCurrentUser();
    if (currentUser.id === requestId) {
      this.setCurrentUser({ ...currentUser, facilitatorStatus: 'approved' });
    }

    this.notify();
  }

  rejectFacilitatorRequest(requestId) {
    const list = this.getFacilitatorRequests().map(req => {
      if (req.id === requestId) {
        return { ...req, status: 'rejected' };
      }
      return req;
    });
    localStorage.setItem(STORAGE_KEYS.FACILITATOR_REQUESTS, JSON.stringify(list));

    const accounts = this.getAccounts();
    const i = accounts.findIndex(a => a.id === requestId);
    if (i >= 0) {
      accounts[i] = { ...accounts[i], facilitatorStatus: 'rejected' };
      this.saveAccounts(accounts);
    }
    const cu = this.getCurrentUser();
    if (cu.id === requestId) this.setCurrentUser({ ...cu, facilitatorStatus: 'rejected' });

    this.notify();
  }

  // --- Test helpers (used by the Test Tools panel only) ---
  addSampleData(programId) {
    const result = this.mutateProgram(programId, p => {
      if (p.sampleDataAdded) return fail('Sample data was already added.');

      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();

      if (!(p.periods || []).length) {
        p.periods = [
          { id: 'per-sample-1', name: 'Period 1' },
          { id: 'per-sample-2', name: 'Period 3' }
        ];
      }
      const [pa, pb = pa] = p.periods;

      p.technologies = [
        { id: 'sample-tech-1', name: 'Prusa MK4 3D Printer', category: '3D Printing & Fabrication', status: 'working', assetNumber: '3DP-01', photo: 'https://images.unsplash.com/photo-1631541909061-71e349d1f203?w=800&auto=format&fit=crop&q=80', note: 'PLA filament is on the left shelf.', hasSensitiveData: false, dataLocation: 'None', manualUrl: '', dateAdded: today, lastChecked: today },
        { id: 'sample-tech-2', name: 'Mirrorless Camera Kit', category: 'Media Production', status: 'working', assetNumber: 'CAM-02', photo: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80', note: 'Active documentary footage is on the card. Do not format.', hasSensitiveData: true, dataLocation: 'SD Card Slot 1: /DCIM/100MEDIA', manualUrl: '', dateAdded: today, lastChecked: today },
        { id: 'sample-tech-3', name: 'VR Workstation', category: 'Computing & VR', status: 'needs-repairs', assetNumber: 'VR-01', photo: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80', note: 'GPU fan is loud. Reported to the facilitator.', hasSensitiveData: true, dataLocation: 'D:\\EAST_VR_Lab\\', manualUrl: '', dateAdded: today, lastChecked: today },
        { id: 'sample-tech-4', name: 'Embroidery Machine', category: 'Textiles & Soft Goods', status: 'maintenance', assetNumber: 'EMB-01', photo: 'https://images.unsplash.com/photo-1605289982774-9a6fef564df8?w=800&auto=format&fit=crop&q=80', note: '', hasSensitiveData: false, dataLocation: 'None', manualUrl: '', dateAdded: today, lastChecked: today },
        ...(p.technologies || [])
      ];

      p.roster = [
        ...(p.roster || []),
        { studentId: 'sample-stud-1', name: 'Maria Lopez', email: 'maria.lopez@example.org', grade: '11th Grade', joinedAt: now, periodId: pa.id },
        { studentId: 'sample-stud-2', name: 'Devon Carter', email: 'devon.carter@example.org', grade: '10th Grade', joinedAt: now, periodId: pa.id },
        { studentId: 'sample-stud-3', name: 'Priya Shah', email: 'priya.shah@example.org', grade: '12th Grade', joinedAt: now, periodId: pb.id }
      ];

      const member = (name, role, grade) => ({ name, role, grade });
      p.projects = [
        {
          id: 'sample-proj-1', name: 'Trail Accessibility Map', status: 'approved', submittedBy: 'Maria Lopez',
          submissionDate: today, approvedDate: today, category: 'GIS & Community Service', periodIds: [pa.id],
          description: 'Mapping surface type and slope on local walking trails so residents with mobility needs can plan visits.',
          photos: ['https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80'],
          teamMembers: [member('Maria Lopez', 'Team Lead', '11th'), member('Devon Carter', 'Field Surveyor', '10th')],
          pastProjectHandlers: [], externalLinks: [],
          communicationLogs: [{ date: today, author: 'Maria Lopez', contactPerson: 'Parks Department', type: 'Meeting', notes: 'Confirmed which trails to survey first.' }]
        },
        {
          id: 'sample-proj-2', name: 'Storm Shelter Locator App', status: 'approved', submittedBy: 'Priya Shah',
          submissionDate: today, approvedDate: today, category: 'Software & Virtual Reality', periodIds: [pa.id, pb.id],
          description: 'A simple mobile-friendly page that shows the nearest community storm shelter and its capacity.',
          photos: ['https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80'],
          teamMembers: [member('Priya Shah', 'Developer', '12th'), member('Devon Carter', 'Tester', '10th')],
          pastProjectHandlers: ['Alumni team (Class of last year, initial data collection)'], externalLinks: [],
          communicationLogs: [{ date: today, author: 'Priya Shah', contactPerson: 'County Emergency Office', type: 'Email', notes: 'Received the official shelter list.' }]
        },
        {
          id: 'sample-proj-3', name: 'Library Oral History Archive', status: 'draft', submittedBy: 'Devon Carter',
          submissionDate: today, approvedDate: null, category: 'Media & Storytelling', periodIds: [pb.id],
          description: 'Recording and cataloging interviews with longtime residents for the public library.',
          photos: ['https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80'],
          teamMembers: [member('Devon Carter', 'Team Lead', '10th')],
          pastProjectHandlers: [], externalLinks: [], communicationLogs: []
        },
        ...(p.projects || [])
      ];

      p.sampleDataAdded = true;
      return { success: true };
    });
    return result || fail('Program not found.');
  }

  // --- Full Demo Reset ---
  resetToDefault() {
    localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(INITIAL_PROGRAMS));
    localStorage.setItem(STORAGE_KEYS.FACILITATOR_REQUESTS, JSON.stringify(INITIAL_FACILITATOR_REQUESTS));
    localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(GUEST_USER));
    this.notify();
  }
}

export const equipStore = new EquipStore();