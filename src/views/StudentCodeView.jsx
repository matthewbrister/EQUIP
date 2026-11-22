import React, { useState } from 'react';
import { equipStore } from '../data/store';

export default function StudentCodeView({ currentUser, setCurrentView }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleCodeChange = (e) => {
    setCode(e.target.value.toUpperCase());
    setError('');
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter your program access code.');
      return;
    }

    setIsJoining(true);
    try {
      const result = await equipStore.joinProgramByCode(code.trim(), currentUser);
      if (result.success) setCurrentView('student');
      else setError(result.message || 'Program not found. Please double-check your code.');
    } finally {
      setIsJoining(false);
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

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isJoining}>
            <span>{isJoining ? 'Joining…' : 'Join Program Workspace'}</span>
            <i className='bx bx-right-arrow-alt'></i>
          </button>
        </form>
      </div>
    </div>
  );
}