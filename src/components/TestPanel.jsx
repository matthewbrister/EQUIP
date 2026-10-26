import React, { useState } from 'react';
import { equipStore } from '../data/store';
import { DEFAULT_PROGRAM_ID } from '../data/mockData';

/*
  Corner window for developers and testers only. Nothing in here exists in the
  real product: it lets a tester cycle between roles and get past dead ends.
*/
const VIEW_AS = [
    { id: 'student', label: 'Student', icon: 'bx-user', demoKey: 'studentJoined', home: 'student' },
    { id: 'facilitator', label: 'Facilitator', icon: 'bx-chalkboard', demoKey: 'facilitatorApproved', home: 'facilitator' },
    { id: 'admin', label: 'Admin', icon: 'bx-shield-quarter', demoKey: 'manager', home: 'manager' }
];

const activeRoleId = (user) => {
    if (user?.role === 'student') return 'student';
    if (user?.role === 'facilitator') return 'facilitator';
    if (user?.role === 'manager') return 'admin';
    return null;
};

export default function TestPanel({ mode, currentUser, navigate, onSelectRole, onTours, onExit }) {
    const [open, setOpen] = useState(() => {
        try {
            const saved = sessionStorage.getItem('equip-panel-open');
            return saved === null ? mode === 'feedback' : saved === 'true';
        } catch { return mode === 'feedback'; }
    });
    const [message, setMessage] = useState('');

    const setOpenSaved = (v) => {
        setOpen(v);
        try { sessionStorage.setItem('equip-panel-open', String(v)); } catch { /* ignore */ }
    };

    const flash = (text) => {
        setMessage(text);
        setTimeout(() => setMessage(''), 2500);
    };

    const defaultProgram = equipStore.getProgram(DEFAULT_PROGRAM_ID);
    const sampleAdded = !!defaultProgram?.sampleDataAdded;
    const current = activeRoleId(currentUser);

    const viewAs = (opt) => {
        onSelectRole(opt.demoKey);
        navigate(opt.home);
    };

    const signedOut = () => {
        onSelectRole('guest');
        navigate('landing');
    };

    const approveMe = () => {
        equipStore.approveFacilitatorRequest(currentUser.id);
        flash('Account approved.');
        navigate('facilitator');
    };

    const joinWithTestCode = () => {
        const res = equipStore.joinProgramByCode(defaultProgram.code, currentUser);
        if (res.success) navigate('student');
        else flash(res.message);
    };

    const addSample = () => {
        const res = equipStore.addSampleData(DEFAULT_PROGRAM_ID);
        flash(res.success ? 'Sample data added to Vilonia High.' : res.message);
    };

    const reset = () => {
        if (window.confirm('Reset all test data (programs, accounts, rosters)? The page will reload.')) {
            equipStore.resetToDefault();
            window.location.reload();
        }
    };

    const isPendingFacilitator =
        currentUser?.role === 'facilitator' && ['pending', 'rejected'].includes(currentUser.facilitatorStatus);
    const isStudentWithoutProgram = currentUser?.role === 'student' && !currentUser.programId;

    if (!open) {
        return (
            <button
                type="button"
                className="test-panel-pill"
                onClick={() => setOpenSaved(true)}
                aria-label="Open test tools"
            >
                <i className='bx bx-wrench'></i>
                <span>Test Tools</span>
            </button>
        );
    }

    return (
        <div className="test-panel page-in" role="complementary" aria-label="Test tools">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <i className='bx bx-wrench' style={{ color: 'var(--color-primary)' }}></i>
                    <strong style={{ fontSize: '0.88rem' }}>Test Tools</strong>
                    <span className="status-badge badge-draft">{mode === 'feedback' ? 'Feedback' : 'Developer'}</span>
                </div>
                <button type="button" onClick={() => setOpenSaved(false)} aria-label="Minimize test tools" style={{ color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: 1 }}>
                    <i className='bx bx-chevron-down'></i>
                </button>
            </div>

            {/* Role cycling */}
            <div className="test-panel-label">View the site as</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', padding: '4px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                {VIEW_AS.map(opt => (
                    <button
                        key={opt.id}
                        type="button"
                        onClick={() => viewAs(opt)}
                        aria-pressed={current === opt.id}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '2px',
                            padding: '0.5rem 0.25rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            background: current === opt.id ? 'var(--bg-surface)' : 'transparent',
                            color: current === opt.id ? 'var(--color-primary)' : 'var(--text-muted)',
                            boxShadow: current === opt.id ? 'var(--shadow-sm)' : 'none',
                            transition: 'var(--transition-fade)'
                        }}
                    >
                        <i className={`bx ${opt.icon}`} style={{ fontSize: '1.15rem' }}></i>
                        {opt.label}
                    </button>
                ))}
            </div>
            <button type="button" className="test-panel-link" onClick={signedOut}>
                Sign out to test Log In / Sign Up
            </button>

            {/* Shortcuts that depend on where the tester is stuck */}
            {(isPendingFacilitator || isStudentWithoutProgram) && (
                <>
                    <div className="test-panel-label">Shortcut</div>
                    {isPendingFacilitator && (
                        <button type="button" className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={approveMe}>
                            <i className='bx bx-check-circle'></i> Approve my facilitator account
                        </button>
                    )}
                    {isStudentWithoutProgram && defaultProgram && (
                        <div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                                Test code for {defaultProgram.name}:
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.08em', textAlign: 'center', padding: '0.4rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', marginBottom: '0.4rem' }}>
                                {defaultProgram.code}
                            </div>
                            <button type="button" className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={joinWithTestCode}>
                                <i className='bx bx-log-in-circle'></i> Join with this code now
                            </button>
                        </div>
                    )}
                </>
            )}

            <div className="test-panel-label">Data</div>
            <button type="button" className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={addSample} disabled={sampleAdded}>
                <i className={`bx ${sampleAdded ? 'bx-check' : 'bx-plus'}`}></i>
                {sampleAdded ? 'Sample data added to Vilonia High' : 'Add sample data to Vilonia High'}
            </button>
            <button type="button" className="test-panel-link" onClick={reset} style={{ color: 'var(--color-danger)' }}>
                Reset all test data
            </button>

            {message && (
                <div role="status" style={{ fontSize: '0.78rem', color: 'var(--color-success)', fontWeight: 600, marginTop: '0.5rem' }}>
                    {message}
                </div>
            )}

            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                {mode === 'feedback' && (
                    <button type="button" className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={onTours}>
                        Walkthroughs
                    </button>
                )}
                <button type="button" className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={onExit}>
                    {mode === 'feedback' ? 'Exit' : 'Back to start'}
                </button>
            </div>
        </div>
    );
}