import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingView from './views/LandingView';
import FacilitatorDashboardView from './views/FacilitatorDashboardView';
import ProgramCreateView from './views/ProgramCreateView';
import StudentCodeView from './views/StudentCodeView';
import StudentDashboardView from './views/StudentDashboardView';
import PublicProgramView from './views/PublicProgramView';
import ManagerAdminView from './views/ManagerAdminView';
import AuthView from './views/AuthView';
import AboutView from './views/AboutView';
import SettingsModal from './components/Modals/SettingsModal';
import EntryGate from './components/EntryGate';
import FeedbackTour from './components/FeedbackTour';
import TestPanel from './components/TestPanel';
import FeedbackRolePicker from './components/FeedbackRolePicker';
import { equipStore } from './data/store';
import { DEMO_USERS } from './data/mockData';

const MODE_KEY = 'equip-entry-mode';
const DONE_KEY = 'equip-feedback-done';

// Which pages need which kind of account. Anything else is public.
const guardView = (view, user) => {
  const role = user?.role;
  switch (view) {
    case 'facilitator':
    case 'program-create':
      return role === 'facilitator' ? view : 'auth';
    case 'join':
      return role === 'student' ? view : 'auth';
    case 'student':
      // Students see no dashboard until they have joined a program with a code
      if (role !== 'student') return 'auth';
      return user.programId ? view : 'join';
    case 'manager':
      return role === 'manager' ? view : 'auth';
    default:
      return view;
  }
};

const presetFor = (view) => ({
  mode: view === 'join' || view === 'student' ? 'signup' : 'signin',
  role: view === 'facilitator' || view === 'program-create' ? 'facilitator' : 'student'
});

export default function App() {
  const [entryMode, setEntryMode] = useState(() => {
    try { return sessionStorage.getItem(MODE_KEY); } catch { return null; }
  });
  const [tourActive, setTourActive] = useState(false);
  const [tourRole, setTourRole] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(() => {
    try { return sessionStorage.getItem(MODE_KEY) === 'feedback'; } catch { return false; }
  });
  const [doneRoles, setDoneRoles] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(DONE_KEY)) || []; } catch { return []; }
  });
  const [currentView, setCurrentView] = useState('landing');
  const [currentUser, setCurrentUser] = useState(equipStore.getCurrentUser());
  const [authPreset, setAuthPreset] = useState(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [, setTick] = useState(0);

  // Subscribe to store updates
  useEffect(() => {
    const unsubscribe = equipStore.subscribe(() => {
      setCurrentUser(equipStore.getCurrentUser());
      setTick(t => t + 1);
    });
    return unsubscribe;
  }, []);

  // Animated page changes: current page fades out and sinks, then the next
  // page fades in while rising. All children navigate through this.
  const [viewPhase, setViewPhase] = useState('in');
  const pendingView = useRef('landing');
  const navTimers = useRef([]);

  const jump = (view) => {
    navTimers.current.forEach(clearTimeout);
    navTimers.current = [];
    pendingView.current = view;
    setCurrentView(view);
  };

  const navigate = useCallback((requested) => {
    // Send people to the sign-in page when a page needs an account they don't have
    const view = guardView(requested, equipStore.getCurrentUser());
    if (view === 'auth' && requested !== 'auth') setAuthPreset(presetFor(requested));
    if (view === pendingView.current) return;
    pendingView.current = view;
    navTimers.current.forEach(clearTimeout);
    navTimers.current = [];
    setViewPhase('out');
    navTimers.current.push(setTimeout(() => {
      setCurrentView(view);
      window.scrollTo({ top: 0, behavior: 'auto' });
      setViewPhase('in');
      navTimers.current.push(setTimeout(() => setViewPhase('idle'), 240));
    }, 150));
  }, []);

  // Safety net: if the user changes (e.g. signs out) while on a protected page
  useEffect(() => {
    if (tourActive) return; // the walkthrough hops between demo roles on purpose
    const target = guardView(currentView, currentUser);
    if (target !== currentView) {
      if (target === 'auth') setAuthPreset(presetFor(currentView));
      jump(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView, currentUser, tourActive]);

  const openAuth = () => {
    setAuthPreset({ mode: 'signin', role: 'student' });
    navigate('auth');
  };

  const handleAuthSuccess = (user) => {
    if (user.role === 'manager') navigate('manager');
    else if (user.role === 'facilitator') navigate('facilitator');
    else if (user.role === 'student') navigate(user.programId ? 'student' : 'join');
    else navigate('landing');
  };

  const handleSignOut = () => {
    equipStore.signOut();
    setCurrentUser(equipStore.getCurrentUser());
    navigate('landing');
  };

  const handleSelectRole = (roleKey) => {
    if (roleKey === 'guest') equipStore.signOut();
    else equipStore.switchRole(roleKey);
    setCurrentUser(equipStore.getCurrentUser());
  };

  const chooseMode = (mode) => {
    try { sessionStorage.setItem(MODE_KEY, mode); } catch { /* ignore */ }
    setEntryMode(mode);
    jump('landing');
    setPickerOpen(mode === 'feedback');
  };

  const resetMode = () => {
    try { sessionStorage.removeItem(MODE_KEY); } catch { /* ignore */ }
    setTourActive(false);
    setPickerOpen(false);
    setEntryMode(null);
    jump('landing');
  };

  const startTour = (role) => {
    setTourRole(role);
    setPickerOpen(false);
    jump('landing');
    setTourActive(true);
  };

  // Back to the role list; the tour just taken is marked complete if they pressed Done
  const finishTour = ({ completed }) => {
    if (completed && tourRole) {
      const next = Array.from(new Set([...doneRoles, tourRole]));
      setDoneRoles(next);
      try { sessionStorage.setItem(DONE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    }
    setTourActive(false);
    equipStore.signOut();
    setCurrentUser(equipStore.getCurrentUser());
    jump('landing');
    setPickerOpen(true);
  };

  if (!entryMode) {
    return <EntryGate onChoose={chooseMode} />;
  }

  if (entryMode === 'feedback' && pickerOpen && !tourActive) {
    return (
      <FeedbackRolePicker
        completed={doneRoles}
        onPick={startTour}
        onExplore={() => { equipStore.signOut(); setCurrentUser(equipStore.getCurrentUser()); jump('landing'); setPickerOpen(false); }}
        onBack={resetMode}
      />
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return (
          <LandingView
            setCurrentView={navigate}
            onSelectRole={handleSelectRole}
          />
        );
      case 'about':
        return <AboutView setCurrentView={navigate} />;
      case 'auth':
        return (
          <AuthView
            currentUser={currentUser}
            preset={authPreset}
            onAuthSuccess={handleAuthSuccess}
            onSignOut={handleSignOut}
          />
        );
      case 'facilitator':
        return (
          <FacilitatorDashboardView
            currentUser={currentUser}
            setCurrentView={navigate}
            onSelectRole={handleSelectRole}
            onSignOut={handleSignOut}
          />
        );
      case 'program-create':
        return (
          <ProgramCreateView
            currentUser={currentUser}
            setCurrentView={navigate}
          />
        );
      case 'join':
        return (
          <StudentCodeView
            currentUser={currentUser}
            setCurrentView={navigate}
          />
        );
      case 'student':
        return (
          <StudentDashboardView
            currentUser={currentUser}
            setCurrentView={navigate}
          />
        );
      case 'public':
        return (
          <PublicProgramView
            setCurrentView={navigate}
          />
        );
      case 'manager':
        return (
          <ManagerAdminView
            setCurrentView={navigate}
            onSelectRole={handleSelectRole}
          />
        );
      default:
        return (
          <LandingView
            setCurrentView={navigate}
            onSelectRole={handleSelectRole}
          />
        );
    }
  };

  return (
    <div className="app-container">
      <Navbar
        currentView={currentView}
        setCurrentView={navigate}
        currentUser={currentUser}
        onOpenAuth={openAuth}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onSignOut={handleSignOut}
      />

      <main className={`main-content page-${viewPhase}`}>
        {renderCurrentView()}
      </main>

      <Footer onOpenSettings={() => setIsSettingsModalOpen(true)} />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {entryMode === 'feedback' && tourActive && (
        <FeedbackTour
          key={tourRole}
          role={tourRole}
          currentView={currentView}
          setCurrentView={navigate}
          onSelectRole={handleSelectRole}
          onClose={finishTour}
        />
      )}

      {!tourActive && (
        <TestPanel
          mode={entryMode}
          currentUser={currentUser}
          navigate={navigate}
          onSelectRole={handleSelectRole}
          onTours={() => setPickerOpen(true)}
          onExit={resetMode}
        />
      )}
    </div>
  );
}