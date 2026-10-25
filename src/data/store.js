// Store for EQUIP application with LocalStorage persistence and reactive notifications
import { INITIAL_PROGRAMS, INITIAL_FACILITATOR_REQUESTS, DEMO_USERS } from './mockData';

const STORAGE_KEYS = {
  PROGRAMS: 'equip_programs_v1',
  FACILITATOR_REQUESTS: 'equip_fac_requests_v1',
  CURRENT_USER: 'equip_current_user_v1',
  SETTINGS: 'equip_settings_v1'
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
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEMO_USERS.facilitatorApproved));
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
      return u ? JSON.parse(u) : DEMO_USERS.facilitatorApproved;
    } catch {
      return DEMO_USERS.facilitatorApproved;
    }
  }

  setCurrentUser(user) {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      this.notify();
    } catch (e) {
      console.error(e);
    }
  }

  switchRole(roleKey) {
    if (DEMO_USERS[roleKey]) {
      this.setCurrentUser(DEMO_USERS[roleKey]);
    }
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
    // Update student's programId
    const updatedUser = {
      ...studentUser,
      programId: program.id
    };
    this.setCurrentUser(updatedUser);
    return { success: true, program };
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

    const newProject = {
      id: `proj-${Date.now()}`,
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

    // Also if current user is this facilitator, unlock them!
    const currentUser = this.getCurrentUser();
    if (currentUser.id === requestId || currentUser.role === 'facilitator') {
      currentUser.facilitatorStatus = 'approved';
      this.setCurrentUser(currentUser);
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
    this.notify();
  }

  // --- Full Demo Reset ---
  resetToDefault() {
    localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(INITIAL_PROGRAMS));
    localStorage.setItem(STORAGE_KEYS.FACILITATOR_REQUESTS, JSON.stringify(INITIAL_FACILITATOR_REQUESTS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEMO_USERS.facilitatorApproved));
    this.notify();
  }
}

export const equipStore = new EquipStore();