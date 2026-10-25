import React from 'react';
import { equipStore } from '../data/store';
import { DEFAULT_PROGRAM_ID } from '../data/mockData';

export default function LandingView({ setCurrentView, onSelectRole }) {
  const programs = equipStore.getPrograms()
    .filter(p => p.status === 'approved')
    .sort((a, b) => (b.id === DEFAULT_PROGRAM_ID) - (a.id === DEFAULT_PROGRAM_ID));

  // Two identical halves so the marquee loops seamlessly
  const half = programs.length ? Array.from({ length: Math.ceil(4 / programs.length) }, () => programs).flat() : [];
  const track = [...half, ...half];

  return (
    <div>
      {/* Clean Hero */}
      <section style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '4.5rem 0 3.5rem'
      }}>
        <div className="container">
          <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              padding: '0.3rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginBottom: '1.25rem'
            }}>
              <i className='bx bx-check-shield' style={{ color: 'var(--color-primary)' }}></i>
              <span>EAST Quick Utility & Inventory Platform</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
              marginBottom: '1rem',
              lineHeight: 1.2
            }}>
              Program Technology & Project Management
            </h1>

            <p style={{
              fontSize: '1.05rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '2rem'
            }}>
              A centralized database for EAST facilitators and students. Track hardware health, safeguard sensitive project assets from being erased, and manage student project approvals.
            </p>

            <div data-tour="hero-actions" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={() => setCurrentView('auth')}>
                <i className='bx bx-log-in'></i>
                <span>Log In</span>
              </button>

              <button className="btn btn-secondary btn-lg" onClick={() => setCurrentView('public')}>
                <i className='bx bx-globe'></i>
                <span>Public Directory</span>
              </button>

              <button className="btn btn-secondary btn-lg" onClick={() => setCurrentView('about')}>
                <i className='bx bx-info-circle'></i>
                <span>Learn More About EQUIP</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Workflow Pillars (Clean, uncluttered, no unnecessary count boxes) */}
      <section style={{ padding: '3.5rem 0' }}>
        <div className="container">
          <div className="grid-3">
            {/* Facilitator Governance */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
                <i className='bx bx-id-card'></i>
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Facilitator Governance</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Verified through Google OAuth 2 and manager approval. Manage classroom room numbers, contact info, and generate brute-force resistant access codes for students.
              </p>
            </div>

            {/* Hardware & Sensitive Data */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
                <i className='bx bx-microchip'></i>
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Hardware & Data Protection</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Catalog 3D printers, cameras, and workstations with live operating statuses, direct links to digital manuals, and notices identifying sensitive active project files.
              </p>
            </div>

            {/* Student Project Archive */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
                <i className='bx bx-git-branch'></i>
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Student Project Archive</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Students join with access codes to upload community project drafts, log client communication, record past project handlers, and await facilitator approval.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Programs: rotating marquee with edge fades */}
      <section data-tour="featured" style={{ background: 'var(--bg-subtle)', padding: '3.5rem 0', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Featured Programs</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Browse active EAST school programs across Arkansas.
              </p>
            </div>
          </div>
        </div>

        {track.length > 0 && (
          <div className="featured-marquee">
            <div className="featured-track" style={{ animationDuration: `${half.length * 7}s` }}>
              {track.map((prog, i) => {
                const isDuplicate = i >= half.length;
                return (
                  <div key={`${prog.id}-${i}`} className="card featured-card" aria-hidden={isDuplicate || undefined}>
                    <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>{prog.name}</h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                          <i className='bx bx-map-pin' style={{ marginRight: '4px' }}></i>
                          {prog.location} • {prog.campusRoomNumber}
                        </p>
                        <p style={{
                          fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem',
                          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                        }}>
                          {prog.description}
                        </p>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Facilitator: <strong>{prog.facilitator?.name}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}