import React, { useEffect, useState } from 'react';
import { equipStore } from '../data/store';
import { auth, db } from '../lib/firebase';
import { collection, doc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';

export default function ManagerAdminView() {
  const [activeTab, setActiveTab] = useState('facilitators'); // 'facilitators' | 'programs'
  const [facilitators, setFacilitators] = useState([]);
  const [isLoadingFacilitators, setIsLoadingFacilitators] = useState(true);
  const [facilitatorError, setFacilitatorError] = useState('');
  const [updatingFacilitatorId, setUpdatingFacilitatorId] = useState(null);

  const programs = equipStore.getPrograms();

  useEffect(() => {
    let active = true;

    const loadFacilitators = async () => {
      if (!db) {
        setFacilitatorError('Firebase is not configured, so facilitator accounts cannot be loaded.');
        setIsLoadingFacilitators(false);
        return;
      }

      try {
        const facilitatorQuery = query(collection(db, 'users'), where('role', '==', 'facilitator'));
        const snapshot = await getDocs(facilitatorQuery);
        if (active) {
          setFacilitators(snapshot.docs
            .filter(account => account.id !== auth?.currentUser?.uid)
            .map(account => ({ id: account.id, ...account.data() })));
        }
      } catch (error) {
        console.error('Unable to load facilitator accounts', error);
        if (active) {
          setFacilitatorError(error.code === 'permission-denied'
            ? `Firestore denied the facilitator list. Publish the latest firebase/firestore.rules to the "${db.app.options.projectId}" Firebase project.`
            : error.message || 'Unable to load facilitator accounts.');
        }
      } finally {
        if (active) setIsLoadingFacilitators(false);
      }
    };

    loadFacilitators();
    return () => { active = false; };
  }, []);

  const pendingRequests = facilitators.filter(account => account.facilitatorStatus === 'pending');
  const approvedRequests = facilitators.filter(account => account.facilitatorStatus === 'approved');

  const draftPrograms = programs.filter(p => p.status === 'draft');
  const approvedPrograms = programs.filter(p => p.status === 'approved');

  const updateFacilitatorStatus = async (accountId, status) => {
    if (!db) return;
    setFacilitatorError('');
    setUpdatingFacilitatorId(accountId);
    try {
      await updateDoc(doc(db, 'users', accountId), {
        facilitatorStatus: status,
        updatedAt: serverTimestamp()
      });
      setFacilitators(accounts => accounts.map(account => (
        account.id === accountId ? { ...account, facilitatorStatus: status } : account
      )));
    } catch (error) {
      console.error(`Unable to ${status} facilitator account`, error);
      setFacilitatorError(error.code === 'permission-denied'
        ? `Firestore denied this approval change. Publish the latest firebase/firestore.rules to the "${db.app.options.projectId}" Firebase project.`
        : error.message || `Unable to ${status} facilitator account.`);
    } finally {
      setUpdatingFacilitatorId(null);
    }
  };

  const handleApproveProgram = async (programId) => {
    await equipStore.approveProgram(programId);
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem', maxWidth: '880px' }}>
      {/* Admin Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Website Manager Portal</h1>
            <span className="brand-tag-east">ADMIN</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            Approve facilitator registrations and review draft EAST programs.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'facilitators' ? 'active' : ''}`}
          onClick={() => setActiveTab('facilitators')}
        >
          <i className='bx bx-user-check'></i>
          <span>Facilitator Accounts ({pendingRequests.length} Pending)</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'programs' ? 'active' : ''}`}
          onClick={() => setActiveTab('programs')}
        >
          <i className='bx bx-building'></i>
          <span>Program Signoffs ({draftPrograms.length} Drafts)</span>
        </button>
      </div>

      {/* TAB 1: FACILITATOR ACCOUNT APPROVALS */}
      {activeTab === 'facilitators' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              Pending Facilitator Registrations
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Approving an account unlocks program creation and student access code generation.
            </p>
          </div>

          {facilitatorError && (
            <div className="alert-box alert-danger" role="alert" style={{ marginBottom: '1rem' }}>
              <i className='bx bx-error-circle'></i>
              <span>{facilitatorError}</span>
            </div>
          )}

          {isLoadingFacilitators ? (
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center', marginBottom: '2rem' }}>
              Loading facilitator accounts…
            </div>
          ) : pendingRequests.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              {pendingRequests.map(req => (
                <div key={req.id} className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ flex: 1, minWidth: '240px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                        <span className="status-badge badge-needs-repairs">Pending Approval</span>
                      </div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{req.name}</h3>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                        {req.email}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        disabled={updatingFacilitatorId !== null}
                        onClick={() => updateFacilitatorStatus(req.id, 'rejected')}
                      >
                        Reject
                      </button>
                      <button
                        className="btn btn-success btn-sm"
                        disabled={updatingFacilitatorId !== null}
                        onClick={() => updateFacilitatorStatus(req.id, 'approved')}
                      >
                        <i className='bx bx-check'></i> Approve Account
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center', marginBottom: '2rem', background: 'var(--bg-subtle)' }}>
              <i className='bx bx-check-circle' style={{ color: 'var(--color-success)', fontSize: '1.5rem', marginBottom: '0.35rem', display: 'inline-block' }}></i>
              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>No pending facilitator account registrations.</div>
            </div>
          )}

          {/* Verified Accounts */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
              Verified Facilitators ({approvedRequests.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {approvedRequests.map(req => (
                <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>
                  <div>
                    <strong>{req.name}</strong> • {req.email} ({req.school})
                  </div>
                  <span className="status-badge badge-working">Approved</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROGRAM SIGNOFFS */}
      {activeTab === 'programs' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              Draft Program Approvals
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Review program location, room numbers, and contact details before publishing to directory.
            </p>
          </div>

          {draftPrograms.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              {draftPrograms.map(prog => (
                <div key={prog.id} className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ flex: 1, minWidth: '240px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                        <span className="status-badge badge-needs-repairs">Draft Program</span>
                      </div>

                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                        {prog.name}
                      </h3>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                        Room: {prog.campusRoomNumber} • {prog.location}
                      </div>

                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Facilitator: {prog.facilitator?.name} ({prog.facilitator?.email})
                      </p>
                    </div>

                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleApproveProgram(prog.id)}
                    >
                      <i className='bx bx-check'></i> Publish Program
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center', marginBottom: '2rem', background: 'var(--bg-subtle)' }}>
              <i className='bx bx-check-circle' style={{ color: 'var(--color-success)', fontSize: '1.5rem', marginBottom: '0.35rem', display: 'inline-block' }}></i>
              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>All submitted programs are live and approved.</div>
            </div>
          )}

          {/* Live Programs */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
              Live Directory Programs ({approvedPrograms.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {approvedPrograms.map(prog => (
                <div key={prog.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>
                  <div>
                    <strong>{prog.name}</strong> • Room: {prog.campusRoomNumber}
                  </div>
                  <span className="status-badge badge-working">Live</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}