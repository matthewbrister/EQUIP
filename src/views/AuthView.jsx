import React, { useState, useEffect, useRef } from 'react';
import { equipStore, avatarFor } from '../data/store';

const ordinal = (n) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

// K through 12
const GRADES = [
    { label: 'K', full: 'Kindergarten' },
    ...Array.from({ length: 12 }, (_, i) => ({ label: String(i + 1), full: `${ordinal(i + 1)} Grade` }))
];

// Mock Google accounts shown in the account chooser
const MOCK_GOOGLE_ACCOUNTS = [
    {
        firstName: 'Taylor', lastName: 'Morgan', email: 'taylor.morgan@gmail.com',
        picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80'
    },
    {
        firstName: 'Jamie', lastName: 'Rivera', email: 'jamie.rivera@gmail.com',
        picture: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80'
    },
    {
        firstName: 'Casey', lastName: 'Nguyen', email: 'casey.nguyen@gmail.com',
        picture: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80'
    }
];

const DEMO_ACCOUNTS = [
    { key: 'facilitatorApproved', label: 'Sarah Jenkins', sub: 'Approved facilitator' },
    { key: 'facilitatorPending', label: 'Emily Thornton', sub: 'Pending facilitator' },
    { key: 'studentJoined', label: 'Caden Miller', sub: 'Student on a roster' },
    { key: 'studentNew', label: 'Alex Rivera', sub: 'Student with no code yet' },
    { key: 'manager', label: 'Jordan Hayes', sub: 'Website manager' }
];

const ROLE_LABEL = { student: 'Student', facilitator: 'Facilitator', manager: 'Website Manager' };

function GoogleLogo({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
    );
}

function Avatar({ src, name, size = 40 }) {
    return (
        <img
            src={src}
            alt=""
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = avatarFor(name); }}
            style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
        />
    );
}

export default function AuthView({ currentUser, preset, onAuthSuccess, onSelectRole, onSignOut }) {
    const startsSignedIn = preset?.mode === 'signin';

    const [mode, setMode] = useState(startsSignedIn ? 'signin' : 'signup');
    const [step, setStep] = useState(startsSignedIn ? 'google' : 'role');
    const [direction, setDirection] = useState('forward');

    const [role, setRole] = useState(preset?.mode === 'signup' ? preset.role || null : null);
    const [grade, setGrade] = useState(null);
    const [profile, setProfile] = useState(null);
    const [user, setUser] = useState(null);
    const [welcomeBack, setWelcomeBack] = useState(false);

    const [googleStatus, setGoogleStatus] = useState('idle'); // 'idle' | 'picking' | 'connecting'
    const [googleError, setGoogleError] = useState(null); // { text, action: 'signin' | 'signup' }
    const [error, setError] = useState('');
    const [inFlow, setInFlow] = useState(false);
    const [showDemo, setShowDemo] = useState(false);

    const timers = useRef([]);
    useEffect(() => () => timers.current.forEach(clearTimeout), []);

    // Which dots to show for the current path (none when just signing in)
    const flowSteps = mode === 'signin'
        ? []
        : role === 'facilitator'
            ? ['role', 'google', 'confirm']
            : ['role', 'grade', 'google', 'confirm'];
    const stepIndex = flowSteps.indexOf(step);

    const go = (next, dir = 'forward') => {
        setDirection(dir);
        setError('');
        setGoogleError(null);
        setStep(next);
    };

    // Log In and Sign Up are two separate paths
    const switchMode = (m) => {
        if (m === mode) return;
        setMode(m);
        setGoogleStatus('idle');
        setProfile(null);
        go(m === 'signin' ? 'google' : 'role');
    };

    const goBack = () => {
        if (stepIndex > 0) go(flowSteps[stepIndex - 1], 'back');
    };

    // After the success screen, move on to the main screen
    useEffect(() => {
        if (step !== 'done' || !user) return undefined;
        const t = setTimeout(() => onAuthSuccess(user), 2000);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, user]);

    const pickGoogleAccount = (acct) => {
        setGoogleStatus('connecting');
        const t = setTimeout(() => {
            const p = { ...acct };
            setProfile(p);
            setGoogleStatus('idle');

            if (mode === 'signin') {
                const res = equipStore.signInWithGoogle(p);
                if (res.success) {
                    setUser(res.user);
                    setWelcomeBack(true);
                    setInFlow(true);
                    go('done');
                } else {
                    setGoogleError({
                        text: `No account exists for ${p.email}. Sign up to create one.`,
                        action: 'signup'
                    });
                }
            } else if (equipStore.findAccountByEmail(p.email)) {
                setGoogleError({
                    text: `An account already exists for ${p.email}. Log in instead.`,
                    action: 'signin'
                });
            } else {
                go('confirm');
            }
        }, 900);
        timers.current.push(t);
    };

    const handleCreate = () => {
        const res = equipStore.createAccountFromGoogle({ profile, role, grade: grade?.full });
        if (res.success) {
            setUser(res.user);
            setInFlow(true);
            go('done');
        } else {
            setError(res.message);
        }
    };

    const signedIn = currentUser && currentUser.role !== 'guest';

    // ---------- Already signed in ----------
    if (signedIn && !inFlow) {
        return (
            <div className="container" style={{ padding: '3.5rem 1.25rem', maxWidth: '460px' }}>
                <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                        <Avatar src={currentUser.avatar} name={currentUser.name} size={64} />
                    </div>
                    <h1 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{currentUser.name}</h1>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{currentUser.email}</div>
                    <span className="status-badge badge-working" style={{ marginBottom: '1.5rem' }}>
                        Signed in as {ROLE_LABEL[currentUser.role] || currentUser.role}
                    </span>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <button className="btn btn-primary" onClick={() => onAuthSuccess(currentUser)}>
                            <span>Continue</span>
                            <i className='bx bx-right-arrow-alt'></i>
                        </button>
                        <button className="btn btn-secondary" onClick={onSignOut}>
                            <i className='bx bx-log-out'></i>
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ---------- Setup steps ----------
    const renderStep = () => {
        switch (step) {
            case 'role':
                return (
                    <>
                        <StepHeading
                            icon="bx-user-pin"
                            title="How will you use EQUIP?"
                            text="Choose the option that describes you."
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', marginBottom: '1.5rem' }}>
                            {[
                                { id: 'student', icon: 'bx-user', title: "I'm a Student", text: "Join your program with your facilitator's access code." },
                                { id: 'facilitator', icon: 'bx-chalkboard', title: "I'm a Facilitator", text: 'Manage your program, roster, technology and projects.' }
                            ].map(r => (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => setRole(r.id)}
                                    style={{
                                        textAlign: 'left',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.85rem',
                                        padding: '0.95rem 1rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: role === r.id ? '2px solid var(--color-primary)' : '1px solid var(--border-strong)',
                                        background: role === r.id ? 'var(--color-primary-light)' : 'var(--bg-surface)',
                                        transition: 'var(--transition-fade)'
                                    }}
                                >
                                    <i className={`bx ${r.icon}`} style={{ fontSize: '1.5rem', color: role === r.id ? 'var(--color-primary)' : 'var(--text-muted)' }}></i>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{r.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.text}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            disabled={!role}
                            onClick={() => go(role === 'student' ? 'grade' : 'google')}
                        >
                            <span>Continue</span>
                            <i className='bx bx-right-arrow-alt'></i>
                        </button>
                    </>
                );

            case 'grade':
                return (
                    <>
                        <StepHeading icon="bx-book-reader" title="What grade are you in?" text="Pick your current grade level." />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            {GRADES.map(g => (
                                <button
                                    key={g.label}
                                    type="button"
                                    onClick={() => setGrade(g)}
                                    aria-pressed={grade?.label === g.label}
                                    style={{
                                        height: '48px',
                                        borderRadius: 'var(--radius-md)',
                                        fontWeight: 700,
                                        fontSize: '1rem',
                                        border: grade?.label === g.label ? '2px solid var(--color-primary)' : '1px solid var(--border-strong)',
                                        background: grade?.label === g.label ? 'var(--color-primary-light)' : 'var(--bg-surface)',
                                        color: grade?.label === g.label ? 'var(--color-primary)' : 'var(--text-main)',
                                        transition: 'var(--transition-fade)'
                                    }}
                                >
                                    {g.label}
                                </button>
                            ))}
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', minHeight: '1.3rem', marginBottom: '1.25rem' }}>
                            {grade ? <>Selected: <strong style={{ color: 'var(--text-main)' }}>{grade.full}</strong></> : 'No grade selected'}
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%' }} disabled={!grade} onClick={() => go('google')}>
                            <span>Continue</span>
                            <i className='bx bx-right-arrow-alt'></i>
                        </button>
                    </>
                );

            case 'google':
                return (
                    <>
                        <StepHeading
                            icon="bxl-google"
                            title={mode === 'signin' ? 'Log in with Google' : 'Connect your Google account'}
                            text={mode === 'signin'
                                ? 'Use the Google account you signed up with.'
                                : 'EQUIP uses Google to sign you in, so there is no password to remember.'}
                        />

                        {googleError && (
                            <div className="alert-box alert-danger" role="alert" style={{ flexWrap: 'wrap' }}>
                                <i className='bx bx-error-circle'></i>
                                <div style={{ flex: 1 }}>
                                    <div>{googleError.text}</div>
                                    <button
                                        type="button"
                                        onClick={() => switchMode(googleError.action)}
                                        style={{ fontWeight: 700, textDecoration: 'underline', color: 'inherit', fontSize: '0.85rem', marginTop: '0.25rem' }}
                                    >
                                        {googleError.action === 'signup' ? 'Go to Sign Up' : 'Go to Log In'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {googleStatus === 'idle' && (
                            <button
                                type="button"
                                onClick={() => setGoogleStatus('picking')}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-strong)',
                                    background: '#ffffff',
                                    color: '#1f1f1f',
                                    fontWeight: 600,
                                    fontSize: '0.95rem',
                                    transition: 'var(--transition-fade)'
                                }}
                            >
                                <GoogleLogo />
                                <span>Continue with Google</span>
                            </button>
                        )}

                        {googleStatus === 'picking' && (
                            <div className="auth-chooser">
                                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.15rem' }}>Choose an account</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>to continue to EQUIP</div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {MOCK_GOOGLE_ACCOUNTS.map(a => (
                                        <button
                                            key={a.email}
                                            type="button"
                                            className="auth-chooser-row"
                                            onClick={() => pickGoogleAccount(a)}
                                        >
                                            <Avatar src={a.picture} name={`${a.firstName} ${a.lastName}`} size={36} />
                                            <div style={{ textAlign: 'left' }}>
                                                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)' }}>{a.firstName} {a.lastName}</div>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{a.email}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <button type="button" onClick={() => setGoogleStatus('idle')} style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    Cancel
                                </button>
                            </div>
                        )}

                        {googleStatus === 'connecting' && (
                            <div style={{ textAlign: 'center', padding: '1.25rem 0' }}>
                                <div className="auth-spinner" aria-hidden="true"></div>
                                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>Connecting to Google…</div>
                            </div>
                        )}

                        <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem' }}>
                            Demo sign-in: no real Google account is used.
                        </p>
                    </>
                );

            case 'confirm':
                return (
                    <>
                        <StepHeading icon="bx-id-card" title="Confirm your details" text="Make sure everything looks right." />
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                            <Avatar src={profile?.picture} name={`${profile?.firstName} ${profile?.lastName}`} size={76} />
                        </div>

                        <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem', overflow: 'hidden' }}>
                            {[
                                ['First name', profile?.firstName],
                                ['Last name', profile?.lastName],
                                ['Email', profile?.email],
                                role === 'student' ? ['Grade', grade?.full] : ['Account type', 'Facilitator']
                            ].map(([label, value], i) => (
                                <div
                                    key={label}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        gap: '1rem',
                                        padding: '0.65rem 0.9rem',
                                        fontSize: '0.88rem',
                                        background: i % 2 ? 'var(--bg-subtle)' : 'var(--bg-surface)'
                                    }}
                                >
                                    <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                                    <strong style={{ textAlign: 'right', wordBreak: 'break-all' }}>{value}</strong>
                                </div>
                            ))}
                        </div>

                        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                            <button type="button" onClick={() => go('google', 'back')} style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                                Not you? Use a different account
                            </button>
                        </div>

                        {error && (
                            <div className="alert-box alert-danger" role="alert">
                                <i className='bx bx-error-circle'></i>
                                <span>{error}</span>
                            </div>
                        )}

                        <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleCreate}>
                            <span>Continue</span>
                            <i className='bx bx-right-arrow-alt'></i>
                        </button>
                    </>
                );

            case 'done':
                return (
                    <div style={{ textAlign: 'center', padding: '1rem 0 0.5rem' }}>
                        <div className="checkmark-wrap">
                            <svg width="96" height="96" viewBox="0 0 56 56" aria-hidden="true">
                                <circle className="checkmark-circle" cx="28" cy="28" r="26" fill="none" stroke="var(--color-success)" strokeWidth="3" />
                                <path className="checkmark-check" d="M16 29 l8 8 l16 -17" fill="none" stroke="var(--color-success)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '1rem' }}>
                            {welcomeBack ? `Welcome back, ${user?.firstName || user?.name?.split(' ')[0]}!` : 'Account created successfully'}
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.35rem' }}>
                            {welcomeBack ? 'Signing you in…' : 'Taking you to the next step…'}
                        </p>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="container" style={{ padding: '3rem 1.25rem', maxWidth: '480px' }}>
            <div data-tour="auth-card" className="card" style={{ padding: '2rem', overflow: 'visible' }}>
                {/* Log In / Sign Up */}
                {step !== 'done' && (
                    <div
                        role="tablist"
                        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', padding: '4px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}
                    >
                        {[{ id: 'signin', label: 'Log In' }, { id: 'signup', label: 'Sign Up' }].map(t => (
                            <button
                                key={t.id}
                                type="button"
                                role="tab"
                                aria-selected={mode === t.id}
                                onClick={() => switchMode(t.id)}
                                style={{
                                    padding: '0.5rem',
                                    borderRadius: 'var(--radius-sm)',
                                    fontWeight: 600,
                                    fontSize: '0.88rem',
                                    background: mode === t.id ? 'var(--bg-surface)' : 'transparent',
                                    color: mode === t.id ? 'var(--text-main)' : 'var(--text-muted)',
                                    boxShadow: mode === t.id ? 'var(--shadow-sm)' : 'none',
                                    transition: 'var(--transition-fade)'
                                }}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                )}

                {stepIndex > 0 && (
                    <button
                        type="button"
                        onClick={goBack}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}
                    >
                        <i className='bx bx-arrow-back'></i> Back
                    </button>
                )}

                <div key={step} className={`auth-step ${direction === 'back' ? 'back' : ''}`}>
                    {renderStep()}
                </div>

                {/* Progress dots */}
                {flowSteps.length > 0 && stepIndex >= 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '1.5rem' }} aria-label={`Step ${stepIndex + 1} of ${flowSteps.length}`}>
                        {flowSteps.map((s, i) => (
                            <span
                                key={s}
                                style={{
                                    width: i === stepIndex ? 18 : 7,
                                    height: 7,
                                    borderRadius: 999,
                                    background: i === stepIndex ? 'var(--color-primary)' : i < stepIndex ? 'var(--color-primary-border)' : 'var(--border-strong)',
                                    transition: 'width 200ms ease, background-color 200ms ease'
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Demo accounts (testing only), on the Log In screen */}
                {mode === 'signin' && step === 'google' && googleStatus === 'idle' && (
                    <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '1.5rem', paddingTop: '0.85rem' }}>
                        <button
                            type="button"
                            onClick={() => setShowDemo(s => !s)}
                            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.3rem', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)' }}
                        >
                            <span>Testing? Use a demo account</span>
                            <i className={`bx bx-chevron-down dropdown-caret ${showDemo ? 'is-open' : ''}`}></i>
                        </button>

                        {showDemo && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.6rem' }}>
                                {DEMO_ACCOUNTS.map(d => (
                                    <button
                                        key={d.key}
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        style={{ justifyContent: 'flex-start', gap: '0.6rem', padding: '0.5rem 0.7rem' }}
                                        onClick={() => {
                                            onSelectRole(d.key);
                                            onAuthSuccess(equipStore.getCurrentUser());
                                        }}
                                    >
                                        <span style={{ fontWeight: 600 }}>{d.label}</span>
                                        <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{d.sub}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function StepHeading({ icon, title, text }) {
    return (
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '2rem', color: 'var(--color-primary)', marginBottom: '0.4rem' }}>
                <i className={`bx ${icon}`}></i>
            </div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{title}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginTop: '0.25rem', lineHeight: 1.45 }}>{text}</p>
        </div>
    );
}