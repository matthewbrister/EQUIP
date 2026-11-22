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
import { equipStore } from './data/store';
import { auth, db, firebaseConfigured, googleProvider, isAdminAccount } from './lib/firebase';
import { deleteUser, onAuthStateChanged, reauthenticateWithPopup, signOut } from 'firebase/auth';
import {
  collection, doc, getDoc, getDocs, limit, query,
  serverTimestamp, setDoc, where, writeBatch
} from 'firebase/firestore';

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
  const [currentView, setCurrentView] = useState('landing');
  const [currentUser, setCurrentUser] = useState(equipStore.getCurrentUser());
  const [authPreset, setAuthPreset] = useState(null);
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [dataError, setDataError] = useState(equipStore.getDataError());
  const [, setTick] = useState(0);

  // Subscribe to store updates
  useEffect(() => {
    const unsubscribe = equipStore.subscribe(() => {
      setCurrentUser(equipStore.getCurrentUser());
      setDataError(equipStore.getDataError());
      setTick(t => t + 1);
    });
    return unsubscribe;
  }, []);

  // Animated page changes: current page fades out and sinks, then the next
  // page fades in while rising. All children navigate through this.
  const [viewPhase, setViewPhase] = useState('in');
  const pendingView = useRef('landing');
  const navTimers = useRef([]);

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

  useEffect(() => {
    if (!firebaseConfigured || !auth || !db) return undefined;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setAuthError('');
        if (!firebaseUser) {
          setIsAuthLoading(false);
          equipStore.signOut();
          setCurrentUser(equipStore.getCurrentUser());
          return;
        }

        setIsAuthLoading(true);
        const signedInUser = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email || 'EQUIP User',
          email: firebaseUser.email || '',
          avatar: firebaseUser.photoURL || '',
          role: 'guest'
        };
        equipStore.setCurrentUser(signedInUser);
        setCurrentUser(signedInUser);

        const profileRef = doc(db, 'users', firebaseUser.uid);
        const profileSnapshot = await getDoc(profileRef);
        let profile = profileSnapshot.exists() ? profileSnapshot.data() : null;

        const pendingRole = sessionStorage.getItem('equip_pending_role');
        const pendingGrade = sessionStorage.getItem('equip_pending_grade');
        const isAdmin = isAdminAccount(firebaseUser);
        const role = isAdmin
          ? 'manager'
          : profile?.role || (pendingRole === 'student' || pendingRole === 'facilitator' ? pendingRole : null);

        if (isAdmin) {
          profile = {
            ...profile,
            name: firebaseUser.displayName || firebaseUser.email || 'EQUIP User',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || '',
            role: 'manager',
            grade: null,
            facilitatorStatus: null,
            programId: null
          };
          sessionStorage.removeItem('equip_pending_role');
          sessionStorage.removeItem('equip_pending_grade');
        } else if (!profile || !profile.role) {
          profile = {
            name: firebaseUser.displayName || firebaseUser.email || 'EQUIP User',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || '',
            role: role || null,
            grade: role === 'student' ? (pendingGrade || profile?.grade || null) : null,
            facilitatorStatus: role === 'facilitator' ? 'pending' : null,
            programId: null,
            createdAt: profile?.createdAt || serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          await setDoc(profileRef, profile, { merge: true });
          sessionStorage.removeItem('equip_pending_role');
          sessionStorage.removeItem('equip_pending_grade');
        }

        const appUser = {
          id: firebaseUser.uid,
          name: profile.name,
          email: profile.email,
          avatar: profile.photoURL,
          role: profile.role || 'guest',
          grade: profile.grade || undefined,
          facilitatorStatus: profile.facilitatorStatus || undefined,
          programId: profile.programId || null
        };

        equipStore.setCurrentUser(appUser);
        setCurrentUser(appUser);

        if (appUser.role === 'manager') navigate('manager');
        else if (appUser.role === 'facilitator') navigate('facilitator');
        else if (appUser.role === 'student') navigate(appUser.programId ? 'student' : 'join');
        else {
          setAuthPreset({
            mode: pendingRole ? 'signup' : 'signin',
            role: pendingRole || 'student'
          });
          navigate('auth');
        }
      } catch (error) {
        console.error('Unable to finish EQUIP sign-in', error);
        setAuthError(error.message || 'Sign-in succeeded, but EQUIP could not load your account. Check the Firestore rules and try again.');
        navigate('auth');
      } finally {
        setIsAuthLoading(false);
      }
    });

    return unsubscribe;
  }, [navigate]);

  // Safety net: if the user changes (e.g. signs out) while on a protected page
  useEffect(() => {
    const guardedView = guardView(currentView, currentUser);
    const target = currentUser?.role === 'guest'
      && guardedView === 'auth'
      && currentView !== 'auth'
      ? 'landing'
      : guardedView;
    if (target !== currentView) {
      if (target === 'auth') setAuthPreset(presetFor(currentView));
      navigate(target);
    }
  }, [currentView, currentUser, navigate]);

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

  const handleSignOut = async () => {
    if (firebaseConfigured && auth) await signOut(auth);
    equipStore.signOut();
    setCurrentUser(equipStore.getCurrentUser());
    navigate('landing');
  };

  const handleDeleteAccount = async () => {
    const firebaseUser = auth?.currentUser;
    if (!firebaseUser || !db) {
      throw new Error('You must be signed in to delete your account.');
    }

    await reauthenticateWithPopup(firebaseUser, googleProvider);
    const profileRef = doc(db, 'users', firebaseUser.uid);
    const profileSnapshot = await getDoc(profileRef);
    if (!profileSnapshot.exists()) {
      throw new Error('No EQUIP profile was found for this account.');
    }

    const profile = profileSnapshot.data();
    if (profile.role === 'manager' || firebaseUser.email?.toLowerCase() === 'matthewbristergaming@gmail.com') {
      throw new Error('The website administrator account cannot be deleted here.');
    }
    if (!['student', 'facilitator'].includes(profile.role)) {
      throw new Error('This account type cannot be deleted from EQUIP.');
    }

    if (profile.role === 'facilitator') {
      const ownedPrograms = await getDocs(query(
        collection(db, 'programs'),
        where('facilitatorId', '==', firebaseUser.uid),
        limit(1)
      ));
      if (profile.programId || !ownedPrograms.empty) {
        throw new Error('A facilitator who owns a program must contact the administrator before deleting their account.');
      }
    }

    const batch = writeBatch(db);
    if (profile.role === 'student' && typeof profile.programId === 'string') {
      const rosterRef = doc(db, 'programs', profile.programId, 'roster', firebaseUser.uid);
      const rosterSnapshot = await getDoc(rosterRef);
      if (rosterSnapshot.exists()) batch.delete(rosterRef);
    }
    batch.delete(profileRef);
    await batch.commit();

    try {
      await deleteUser(firebaseUser);
    } catch (error) {
      try {
        await setDoc(profileRef, {
          name: profile.name,
          email: firebaseUser.email || profile.email,
          photoURL: profile.photoURL || '',
          role: profile.role,
          grade: profile.role === 'student' ? profile.grade || '' : null,
          facilitatorStatus: profile.role === 'facilitator' ? 'pending' : null,
          programId: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch (restoreError) {
        console.error('Unable to restore the EQUIP profile after account deletion failed', restoreError);
        throw new Error('Account deletion failed and the EQUIP profile could not be restored. Contact the website administrator.');
      }
      throw new Error(`Account deletion failed. Your profile was restored, but you may need to rejoin your lab with an access code. ${error.message || ''}`.trim());
    }

    equipStore.signOut();
    setCurrentUser(equipStore.getCurrentUser());
    navigate('landing');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingView setCurrentView={navigate} />;
      case 'about':
        return <AboutView setCurrentView={navigate} />;
      case 'auth':
        return (
          <AuthView
            currentUser={currentUser}
            preset={authPreset}
            authError={authError}
            isAuthLoading={isAuthLoading}
            onAuthSuccess={handleAuthSuccess}
            onSignOut={handleSignOut}
          />
        );
      case 'facilitator':
        return (
          <FacilitatorDashboardView
            currentUser={currentUser}
            setCurrentView={navigate}
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
        return <ManagerAdminView />;
      default:
        return <LandingView setCurrentView={navigate} />;
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
        {dataError && (
          <div className="container" style={{ paddingTop: '1rem' }}>
            <div className="alert-box alert-danger" role="alert">
              <i className='bx bx-error-circle'></i>
              <span>{dataError}</span>
              <button type="button" onClick={() => equipStore.clearDataError()} aria-label="Dismiss error">
                <i className='bx bx-x'></i>
              </button>
            </div>
          </div>
        )}
        {renderCurrentView()}
      </main>

      <Footer onOpenSettings={() => setIsSettingsModalOpen(true)} />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentUser={currentUser}
        onDeleteAccount={handleDeleteAccount}
      />

    </div>
  );
}