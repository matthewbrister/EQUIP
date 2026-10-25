import React from 'react';

export const FEEDBACK_ROLES = [
    {
        id: 'facilitator',
        icon: 'bx-chalkboard',
        title: 'Facilitator',
        text: 'Programs, access codes, roster and class periods, technology, and project reviews.'
    },
    {
        id: 'student',
        icon: 'bx-user',
        title: 'Student',
        text: 'Creating an account, joining a program with a code, and your dashboard.'
    },
    {
        id: 'admin',
        icon: 'bx-shield-quarter',
        title: 'Website Admin',
        text: 'Approving facilitator accounts and publishing programs to the directory.'
    }
];

export default function FeedbackRolePicker({ completed, onPick, onExplore, onBack }) {
    const doneCount = FEEDBACK_ROLES.filter(r => completed.includes(r.id)).length;
    const allDone = doneCount === FEEDBACK_ROLES.length;

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
            background: 'var(--bg-app)'
        }}>
            <div className="auth-step" style={{ width: '100%', maxWidth: '560px' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '2rem', color: 'var(--color-primary)', marginBottom: '0.4rem' }}>
                        <i className='bx bx-message-square-detail'></i>
                    </div>
                    <h1 style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                        Which role are you reviewing?
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                        Each walkthrough is short. Do one, or all three.
                    </p>
                </div>

                {allDone && (
                    <div className="alert-box alert-success" role="status">
                        <i className='bx bx-check-circle'></i>
                        <span>All three walkthroughs complete. Thank you for the feedback!</span>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                    {FEEDBACK_ROLES.map(r => {
                        const done = completed.includes(r.id);
                        return (
                            <button
                                key={r.id}
                                type="button"
                                onClick={() => onPick(r.id)}
                                style={{
                                    textAlign: 'left',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.9rem',
                                    padding: '1rem 1.1rem',
                                    borderRadius: 'var(--radius-lg)',
                                    border: done ? '1px solid var(--color-success-border)' : '1px solid var(--border-strong)',
                                    background: done ? 'var(--color-success-bg)' : 'var(--bg-surface)',
                                    boxShadow: 'var(--shadow-sm)',
                                    transition: 'var(--transition-fade)'
                                }}
                            >
                                <i
                                    className={`bx ${r.icon}`}
                                    style={{ fontSize: '1.6rem', color: done ? 'var(--color-success)' : 'var(--color-primary)' }}
                                ></i>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>{r.title}</div>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>{r.text}</div>
                                </div>
                                {done ? (
                                    <span className="status-badge badge-approved">
                                        <i className='bx bx-check'></i> Completed
                                    </span>
                                ) : (
                                    <i className='bx bx-right-arrow-alt' style={{ fontSize: '1.3rem', color: 'var(--text-muted)' }}></i>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                    <button type="button" onClick={onBack} style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        <i className='bx bx-arrow-back' style={{ verticalAlign: 'middle' }}></i> Back
                    </button>
                    <button type="button" className={`btn ${allDone ? 'btn-primary' : 'btn-secondary'}`} onClick={onExplore}>
                        <span>Explore the site on my own</span>
                        <i className='bx bx-right-arrow-alt'></i>
                    </button>
                </div>
            </div>
        </div>
    );
}