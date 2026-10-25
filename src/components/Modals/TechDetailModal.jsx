import React, { useState, useEffect } from 'react';
import Dropdown from '../Dropdown';

export default function TechDetailModal({ tech, isOpen, onClose, isFacilitator, onUpdateStatus, onDelete }) {
  const [currentStatus, setCurrentStatus] = useState(tech?.status);

  // Keep local status in sync when a different item is opened
  useEffect(() => {
    setCurrentStatus(tech?.status);
  }, [tech]);

  if (!isOpen || !tech) return null;

  const getStatusBadge = (st) => {
    switch (st) {
      case 'working':
        return <span className="status-badge badge-working">Working</span>;
      case 'needs-repairs':
        return <span className="status-badge badge-needs-repairs">Needs Repairs</span>;
      case 'maintenance':
        return <span className="status-badge badge-maintenance">Maintenance</span>;
      default:
        return <span className="status-badge badge-offline">Offline</span>;
    }
  };

  const handleStatusChange = (newSt) => {
    setCurrentStatus(newSt);
    if (onUpdateStatus) {
      onUpdateStatus(tech.id, newSt);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-dialog-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700, background: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: 'var(--radius-sm)' }}>
              {tech.assetNumber || 'TECH'}
            </span>
            <h3 className="modal-title" style={{ fontSize: '1.15rem' }}>{tech.name}</h3>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose} aria-label="Close">
            <i className='bx bx-x' style={{ fontSize: '1.25rem' }}></i>
          </button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '220px', background: '#0f172a' }}>
              <img
                src={tech.photo}
                alt={tech.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                {getStatusBadge(tech.status)}
              </div>
            </div>

            {/* Sensitive Project Data Banner */}
            {tech.hasSensitiveData && (
              <div className="alert-box alert-warning">
                <i className='bx bx-shield-quarter' style={{ fontSize: '1.3rem' }}></i>
                <div>
                  <strong>PROTECTED PROJECT DATA NOTICE:</strong>
                  <p style={{ fontSize: '0.82rem', marginTop: '0.2rem' }}>
                    {tech.note || "This equipment contains active student project assets. Do not wipe or reformat."}
                  </p>
                  {tech.dataLocation && (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', marginTop: '0.35rem' }}>
                      Directory: {tech.dataLocation}
                    </div>
                  )}
                </div>
              </div>
            )}

            {tech.note && !tech.hasSensitiveData && (
              <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.85rem', fontSize: '0.88rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Handling Note:</div>
                <div style={{ color: 'var(--text-secondary)' }}>{tech.note}</div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {/* Digital Manual Link */}
              <div className="card" style={{ padding: '0.85rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>Digital Manual</div>
                {tech.manualUrl ? (
                  <a
                    href={tech.manualUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary btn-sm"
                    style={{ width: '100%' }}
                  >
                    <span>Open Manual</span>
                    <i className='bx bx-link-external'></i>
                  </a>
                ) : (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No digital manual linked.</p>
                )}
              </div>

              {/* Facilitator Status Editor */}
              {isFacilitator && (
                <div className="card" style={{ padding: '0.85rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>Update Status</div>
                  <Dropdown
                    value={currentStatus}
                    onChange={handleStatusChange}
                    style={{ fontSize: '0.82rem', padding: '0.4rem' }}
                    options={[
                      { value: 'working', label: 'Working' },
                      { value: 'needs-repairs', label: 'Needs Repairs' },
                      { value: 'maintenance', label: 'Maintenance' },
                      { value: 'offline', label: 'Offline' }
                    ]}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: isFacilitator ? 'space-between' : 'flex-end' }}>
          {isFacilitator && (
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => {
                if (window.confirm(`Delete ${tech.name}?`)) {
                  onDelete(tech.id);
                  onClose();
                }
              }}
            >
              <i className='bx bx-trash'></i> Delete
            </button>
          )}

          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}