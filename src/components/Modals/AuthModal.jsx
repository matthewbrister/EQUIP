import React from 'react';

export default function AuthModal({ isOpen, onClose, currentUser, onSelectRole }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className='bx bxl-google' style={{ fontSize: '1.4rem' }}></i>
            <div>
              <h3 className="modal-title">Authentication & Roles</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Google OAuth 2 Architecture</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose} aria-label="Close">
            <i className='bx bx-x' style={{ fontSize: '1.25rem' }}></i>
          </button>
        </div>

        <div className="modal-body">
          <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              Current Profile
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{currentUser.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{currentUser.email}</div>
              </div>
            </div>
          </div>

          <div className="alert-box alert-info" style={{ marginBottom: '1.25rem' }}>
            <i className='bx bx-info-circle'></i>
            <div style={{ fontSize: '0.8rem' }}>
              <strong>Policy:</strong> Facilitator accounts require website manager approval to publish programs. Student accounts require no approval and access labs directly via program code.
            </div>
          </div>

          <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Switch Account for Testing:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <button 
              className="btn btn-secondary" 
              style={{ justifyContent: 'space-between', padding: '0.6rem 0.85rem' }}
              onClick={() => { onSelectRole('facilitatorApproved'); onClose(); }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className='bx bx-check-circle'></i>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Sarah Jenkins (Approved Facilitator)</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>sjenkins@bentonvillek12.org</div>
                </div>
              </div>
              <i className='bx bx-chevron-right'></i>
            </button>

            <button 
              className="btn btn-secondary" 
              style={{ justifyContent: 'space-between', padding: '0.6rem 0.85rem' }}
              onClick={() => { onSelectRole('facilitatorPending'); onClose(); }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className='bx bx-time'></i>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Emily Thornton (Pending Facilitator)</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ethornton@rogersschools.net</div>
                </div>
              </div>
              <i className='bx bx-chevron-right'></i>
            </button>

            <button 
              className="btn btn-secondary" 
              style={{ justifyContent: 'space-between', padding: '0.6rem 0.85rem' }}
              onClick={() => { onSelectRole('studentJoined'); onClose(); }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className='bx bx-user'></i>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Caden Miller (Enrolled Student)</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>cmiller@students.bentonvillek12.org</div>
                </div>
              </div>
              <i className='bx bx-chevron-right'></i>
            </button>

            <button 
              className="btn btn-secondary" 
              style={{ justifyContent: 'space-between', padding: '0.6rem 0.85rem' }}
              onClick={() => { onSelectRole('manager'); onClose(); }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className='bx bx-shield-quarter'></i>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Jordan Hayes (Website Manager)</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>jhayes@eastproject.org</div>
                </div>
              </div>
              <i className='bx bx-chevron-right'></i>
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
