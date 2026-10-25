import React, { useState } from 'react';

export default function ProjectDetailModal({ 
  project, 
  isOpen, 
  onClose, 
  isFacilitator, 
  onApprove, 
  onReject 
}) {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  if (!isOpen || !project) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-dialog-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, background: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: 'var(--radius-sm)' }}>
              {project.category}
            </span>
            <h3 className="modal-title" style={{ fontSize: '1.15rem' }}>{project.name}</h3>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose} aria-label="Close">
            <i className='bx bx-x' style={{ fontSize: '1.25rem' }}></i>
          </button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              {project.status === 'approved' && <span className="status-badge badge-approved">Approved</span>}
              {project.status === 'draft' && <span className="status-badge badge-draft">Draft</span>}
              {project.status === 'needs-revisions' && <span className="status-badge badge-needs-repairs">Revisions Requested</span>}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Submitted by <strong>{project.submittedBy}</strong> on {project.submissionDate}
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {project.description}
            </p>
          </div>

          <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
            {/* Team Members */}
            <div className="card" style={{ padding: '0.85rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>Team Members</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {project.teamMembers && project.teamMembers.map((m, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', background: 'var(--bg-subtle)', padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                    <span>{m.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{m.role} ({m.grade})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Past Handlers */}
            <div className="card" style={{ padding: '0.85rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>Past Handlers</div>
              {project.pastProjectHandlers && project.pastProjectHandlers.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {project.pastProjectHandlers.map((h, idx) => (
                    <div key={idx} style={{ fontSize: '0.8rem', background: 'var(--bg-subtle)', padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)' }}>
                      {h}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cycle initiated this academic year.</p>
              )}
            </div>
          </div>

          {/* Communication Logs */}
          <div className="card" style={{ padding: '0.85rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>Communication Logs</div>
            {project.communicationLogs && project.communicationLogs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {project.communicationLogs.map((log, idx) => (
                  <div key={idx} style={{ borderLeft: '2px solid var(--color-primary)', paddingLeft: '0.75rem', fontSize: '0.8rem' }}>
                    <div style={{ fontWeight: 600 }}>{log.contactPerson} ({log.type}) • {log.date}</div>
                    <div style={{ color: 'var(--text-secondary)' }}>"{log.notes}"</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No communication logs recorded.</p>
            )}
          </div>

          {/* Facilitator Review Actions */}
          {isFacilitator && project.status === 'draft' && (
            <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>Facilitator Action</div>
              {showRejectInput ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Feedback for revision..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowRejectInput(false)}>
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        onReject(project.id, rejectReason);
                        onClose();
                      }}
                    >
                      Send Revision Request
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    type="button" 
                    className="btn btn-success btn-sm"
                    onClick={() => {
                      onApprove(project.id);
                      onClose();
                    }}
                  >
                    <i className='bx bx-check'></i> Approve & Publish
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowRejectInput(true)}
                  >
                    Request Changes
                  </button>
                </div>
              )}
            </div>
          )}
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
