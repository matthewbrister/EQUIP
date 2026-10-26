import React, { useState } from 'react';
import { equipStore } from '../data/store';

export default function ManagerAdminView({ setCurrentView, onSelectRole }) {
  const [activeTab, setActiveTab] = useState('facilitators'); // 'facilitators' | 'programs'

  const facilitatorRequests = equipStore.getFacilitatorRequests();
  const programs = equipStore.getPrograms();

  const pendingRequests = facilitatorRequests.filter(r => r.status === 'pending');
  const approvedRequests = facilitatorRequests.filter(r => r.status === 'approved');

  const draftPrograms = programs.filter(p => p.status === 'draft');
  const approvedPrograms = programs.filter(p => p.status === 'approved');

  const handleApproveFacilitator = (reqId) => {
    equipStore.approveFacilitatorRequest(reqId);
  };

  const handleRejectFacilitator = (reqId) => {
    equipStore.rejectFacilitatorRequest(reqId);
  };

  const handleApproveProgram = (programId) => {
    equipStore.approveProgram(programId);
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

          {pendingRequests.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              {pendingRequests.map(req => (
                <div key={req.id} className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ flex: 1, minWidth: '240px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                        <span className="status-badge badge-needs-repairs">Pending Approval</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{req.school}</span>
                      </div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{req.name}</h3>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                        {req.email} • {req.googleAuthId ? 'Google OAuth Token Verified' : 'Email not independently verified'}
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {req.notes}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleRejectFacilitator(req.id)}
                      >
                        Reject
                      </button>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleApproveFacilitator(req.id)}
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
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600 }}>
                          Code: {prog.code}
                        </span>
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