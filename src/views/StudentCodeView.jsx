import React, { useState } from 'react';
import { equipStore } from '../data/store';

export default function StudentCodeView({ currentUser, setCurrentView }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [matchedProgram, setMatchedProgram] = useState(null);

  const programs = equipStore.getPrograms();

  const handleCodeChange = (e) => {
    let val = e.target.value.toUpperCase();
    setCode(val);
    setError('');

    const clean = val.trim();
    if (clean.length >= 8) {
      const match = equipStore.getProgramByCode(clean);
      if (match) {
        setMatchedProgram(match);
      } else {
        setMatchedProgram(null);
      }
    } else {
      setMatchedProgram(null);
    }
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter your program access code.');
      return;
    }

    const result = equipStore.joinProgramByCode(code.trim(), currentUser);
    if (result.success) {
      setCurrentView('student');
    } else {
      setError(result.message || 'Program not found. Please double-check your code.');
    }
  };

  const handleQuickFill = (sampleCode) => {
    setCode(sampleCode);
    const match = equipStore.getProgramByCode(sampleCode);
    if (match) {
      setMatchedProgram(match);
      setError('');
    }
  };

  return (
    <div className="container" style={{ padding: '3.5rem 1.25rem', maxWidth: '540px' }}>
      <div data-tour="code-card" className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
          <i className='bx bx-key'></i>
        </div>

        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.35rem' }}>
          Enter EAST Access Code
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.75rem' }}>
          Enter the secure code provided by your facilitator to view technology manuals and upload project drafts.
        </p>

        {error && (
          <div className="alert-box alert-danger" style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
            <i className='bx bx-error-circle'></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleJoin} style={{ marginBottom: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="EQ-XXXX-XXXX"
              value={code}
              onChange={handleCodeChange}
              maxLength={15}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.4rem',
                textAlign: 'center',
                letterSpacing: '0.1em',
                padding: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}
              autoFocus
            />
          </div>

          {matchedProgram && (
            <div style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              textAlign: 'left',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-success)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                <i className='bx bx-check-circle'></i> Program Verified
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                {matchedProgram.name}
              </h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {matchedProgram.campusRoomNumber} • {matchedProgram.location}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                Facilitator: <strong>{matchedProgram.facilitator?.name}</strong>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            <span>Join Program Workspace</span>
            <i className='bx bx-right-arrow-alt'></i>
          </button>
        </form>

        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Sample Codes for Testing:
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {programs.map(p => (
              <button
                key={p.id}
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickFill(p.code)}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
              >
                {p.code}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}