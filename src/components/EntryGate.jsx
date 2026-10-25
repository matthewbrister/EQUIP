import React from 'react';

export default function EntryGate({ onChoose }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.25rem',
      background: 'var(--bg-app)'
    }}>
      <div style={{ width: '100%', maxWidth: '540px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div className="brand-logo-mark" style={{ margin: '0 auto 0.75rem', width: '44px', height: '44px', fontSize: '1.5rem' }}>
            <i className='bx bx-microchip'></i>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Welcome to EQUIP</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            How would you like to continue?
          </p>
        </div>

        {/* Facilitator feedback: highlighted */}
        <button
          type="button"
          onClick={() => onChoose('feedback')}
          style={{
            width: '100%',
            textAlign: 'left',
            padding: '1.1rem 1.25rem',
            marginBottom: '0.75rem',
            borderRadius: 'var(--radius-lg)',
            border: '2px solid var(--color-primary)',
            background: 'var(--color-primary-light)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.9rem',
            transition: 'var(--transition-fade)'
          }}
        >
          <i className='bx bx-message-square-detail' style={{ fontSize: '1.7rem', color: 'var(--color-primary)' }}></i>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>Facilitator Feedback</span>
              <span className="status-badge badge-approved">Reviewing the site?</span>
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.45 }}>
              Take a short guided walkthrough of EQUIP, then explore and share your thoughts with the developer.
            </div>
          </div>
          <i className='bx bx-right-arrow-alt' style={{ fontSize: '1.4rem', color: 'var(--color-primary)' }}></i>
        </button>

        {/* Developer / normal test view */}
        <button
          type="button"
          className="card"
          onClick={() => onChoose('dev')}
          style={{
            width: '100%',
            textAlign: 'left',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.9rem',
            cursor: 'pointer'
          }}
        >
          <i className='bx bx-code-alt' style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}></i>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>Continue to Test View</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Developer mode: go straight to the site with no walkthrough.
            </div>
          </div>
          <i className='bx bx-chevron-right' style={{ fontSize: '1.3rem', color: 'var(--text-muted)' }}></i>
        </button>
      </div>
    </div>
  );
}