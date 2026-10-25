import React, { useState } from 'react';

export default function QrCodeModal({ program, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !program) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(program.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className='bx bx-qr-scan' style={{ fontSize: '1.25rem', color: 'var(--color-primary)' }}></i>
            <div>
              <h3 className="modal-title">Student Access Code</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{program.name}</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose} aria-label="Close">
            <i className='bx bx-x' style={{ fontSize: '1.25rem' }}></i>
          </button>
        </div>

        <div className="modal-body" style={{ textAlign: 'center', padding: '1.5rem 1.25rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Students enter this secure code to view classroom equipment and upload projects.
          </p>

          {/* Secure Code Display */}
          <div style={{ 
            background: 'var(--bg-subtle)', 
            borderRadius: 'var(--radius-md)', 
            padding: '1.5rem', 
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.25rem'
          }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              SECURE ACCESS CODE
            </div>

            <div style={{ 
              fontFamily: 'var(--font-mono)', 
              fontSize: '1.8rem', 
              fontWeight: 800, 
              letterSpacing: '0.1em', 
              color: 'var(--text-main)',
              marginBottom: '1rem'
            }}>
              {program.code}
            </div>

            {/* QR Code SVG */}
            <div style={{ 
              background: 'white', 
              padding: '0.75rem', 
              borderRadius: 'var(--radius-sm)', 
              width: '140px', 
              height: '140px', 
              margin: '0 auto 1rem',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg viewBox="0 0 100 100" width="120" height="120">
                <rect width="100" height="100" fill="white" />
                <rect x="10" y="10" width="25" height="25" fill="#0f172a" />
                <rect x="15" y="15" width="15" height="15" fill="white" />
                <rect x="18" y="18" width="9" height="9" fill="#0f172a" />
                
                <rect x="65" y="10" width="25" height="25" fill="#0f172a" />
                <rect x="70" y="15" width="15" height="15" fill="white" />
                <rect x="73" y="18" width="9" height="9" fill="#0f172a" />
                
                <rect x="10" y="65" width="25" height="25" fill="#0f172a" />
                <rect x="15" y="70" width="15" height="15" fill="white" />
                <rect x="18" y="73" width="9" height="9" fill="#0f172a" />
                
                <rect x="42" y="12" width="6" height="12" fill="#0f172a" />
                <rect x="52" y="18" width="6" height="18" fill="#0f172a" />
                <rect x="42" y="32" width="18" height="6" fill="#0f172a" />
                <rect x="12" y="42" width="12" height="6" fill="#0f172a" />
                <rect x="28" y="42" width="6" height="18" fill="#0f172a" />
                <rect x="42" y="42" width="16" height="16" fill="#0f172a" />
                <rect x="65" y="42" width="8" height="14" fill="#0f172a" />
                <rect x="78" y="42" width="12" height="6" fill="#0f172a" />
                <rect x="42" y="65" width="10" height="25" fill="#0f172a" />
                <rect x="58" y="65" width="16" height="8" fill="#0f172a" />
                <rect x="78" y="65" width="12" height="12" fill="#0f172a" />
                <rect x="65" y="80" width="25" height="10" fill="#0f172a" />
              </svg>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Room {program.campusRoomNumber}
            </div>
          </div>

          <button className="btn btn-primary" onClick={handleCopy} style={{ width: '100%' }}>
            <i className={`bx ${copied ? 'bx-check' : 'bx-copy'}`}></i>
            <span>{copied ? 'Code Copied!' : 'Copy Access Code'}</span>
          </button>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
