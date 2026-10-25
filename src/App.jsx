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
import AuthModal from './components/Modals/AuthModal';
import SettingsModal from './components/Modals/SettingsModal';
import EntryGate from './components/EntryGate';
import FeedbackTour, { FeedbackPill } from './components/FeedbackTour';
import { equipStore } from './data/store';
import { DEMO_USERS } from './data/mockData';

const MODE_KEY = 'equip-entry-mode';

export default function App() {
  const [entryMode, setEntryMode] = useState(() => {
    try { return sessionStorage.getItem(MODE_KEY); } catch { return null; }
  });
  const [tourActive, setTourActive] = useState(false);
  const [currentView, setCurrentView] = useState('landing');
  const [currentUser, setCurrentUser] = useState(equipStore.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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

  const navigate = useCallback((view) => {
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

  const handleSelectRole = (roleKey) => {
    equipStore.switchRole(roleKey);
    setCurrentUser(equipStore.getCurrentUser());
  };

  const chooseMode = (mode) => {
    try { sessionStorage.setItem(MODE_KEY, mode); } catch { /* ignore */ }
    setEntryMode(mode);
    jump('landing');
    if (mode === 'feedback') setTourActive(true);
  };

  const resetMode = () => {
    try { sessionStorage.removeItem(MODE_KEY); } catch { /* ignore */ }
    setTourActive(false);
    setEntryMode(null);
    jump('landing');
  };

  const finishTour = () => {
    setTourActive(false);
    navigate('landing');
  };

  if (!entryMode) {
    return <EntryGate onChoose={chooseMode} />;
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
      case 'facilitator':
        return (
          <FacilitatorDashboardView
            currentUser={currentUser}
            setCurrentView={navigate}
            onSelectRole={handleSelectRole}
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
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      <main className={`main-content page-${viewPhase}`}>
        {renderCurrentView()}
      </main>

      <Footer onOpenSettings={() => setIsSettingsModalOpen(true)} />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onSelectRole={handleSelectRole}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {entryMode === 'feedback' && tourActive && (
        <FeedbackTour
          currentView={currentView}
          setCurrentView={navigate}
          onSelectRole={handleSelectRole}
          onClose={finishTour}
        />
      )}

      {entryMode === 'feedback' && !tourActive && (
        <FeedbackPill onRestart={() => setTourActive(true)} onSwitchMode={resetMode} />
      )}
    </div>
  );
}