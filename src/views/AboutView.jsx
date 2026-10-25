import React from 'react';

const AUDIENCES = [
    {
        icon: 'bx-chalkboard',
        title: 'Facilitators',
        text: 'Run your program from one place: track equipment health, protect sensitive project files, organize students into class periods, and review project submissions.'
    },
    {
        icon: 'bx-user',
        title: 'Students',
        text: "Join your program with your facilitator's access code to see what equipment is ready, read manuals, and submit your team's community projects."
    },
    {
        icon: 'bx-shield-quarter',
        title: 'Website Managers',
        text: 'Verify new facilitator accounts and publish programs to the public directory so the right people have access and every listing is reviewed.'
    }
];

const STEPS = [
    { title: 'Sign in with Google', text: 'Everyone creates an account in a few quick steps.' },
    { title: 'Facilitators get approved', text: 'A website manager verifies facilitator accounts before programs can be created.' },
    { title: 'Students join with a code', text: "Entering the facilitator's access code puts a student on that program's roster." },
    { title: 'Work, review, publish', text: 'Students submit projects, facilitators approve them, and approved work can be shared publicly.' }
];

export default function AboutView({ setCurrentView }) {
    return (
        <div>
            {/* Intro */}
            <section style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', padding: '4rem 0 3rem' }}>
                <div className="container">
                    <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
                        <h1 style={{ fontSize: 'clamp(1.9rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
                            About EQUIP
                        </h1>
                        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                            EQUIP is the EAST Quick Utility and Inventory Platform. It gives EAST labs one organized place to keep track of their technology, protect student project work, and showcase what students build for their communities.
                        </p>
                    </div>
                </div>
            </section>

            {/* About EAST */}
            <section style={{ padding: '3rem 0 1rem' }}>
                <div className="container" style={{ maxWidth: '760px' }}>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.6rem' }}>Built for EAST programs</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.65 }}>
                        EAST (Environmental and Spatial Technology) is a project-based service learning program where students use industry-level technology to solve real problems in their communities. Labs hold expensive, shared equipment and long-running student projects, which makes good record keeping essential. That is the gap EQUIP fills.
                    </p>
                </div>
            </section>

            {/* Audiences */}
            <section style={{ padding: '2rem 0 3rem' }}>
                <div className="container">
                    <div className="grid-3">
                        {AUDIENCES.map(a => (
                            <div key={a.title} className="card" style={{ padding: '1.5rem' }}>
                                <div style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
                                    <i className={`bx ${a.icon}`}></i>
                                </div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{a.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.55 }}>{a.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section style={{ background: 'var(--bg-subtle)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', padding: '3rem 0' }}>
                <div className="container">
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.5rem', textAlign: 'center' }}>How it works</h2>
                    <div className="grid-2">
                        {STEPS.map((s, i) => (
                            <div key={s.title} className="card" style={{ padding: '1.25rem', display: 'flex', gap: '0.9rem', alignItems: 'flex-start' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                                    background: 'var(--color-primary-light)', color: 'var(--color-primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem'
                                }}>
                                    {i + 1}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{s.title}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>{s.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Privacy */}
            <section style={{ padding: '3rem 0' }}>
                <div className="container" style={{ maxWidth: '760px' }}>
                    <div className="card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <i className='bx bx-lock-alt' style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}></i>
                        <div>
                            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.3rem' }}>Private by default</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                A program's technology inventory and student projects are only visible to people with its access code. Facilitators can choose to make either one public, and can change that at any time in their program settings. Student rosters and class periods are always visible only to the facilitator.
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
                        <button className="btn btn-primary" onClick={() => setCurrentView('auth')}>
                            <i className='bx bx-user-plus'></i>
                            <span>Get Started</span>
                        </button>
                        <button className="btn btn-secondary" onClick={() => setCurrentView('public')}>
                            <i className='bx bx-globe'></i>
                            <span>Browse the Directory</span>
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}