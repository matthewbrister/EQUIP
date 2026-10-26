import React, { useState, useEffect, useRef } from 'react';

const ROLE_LABEL = { student: 'Student', facilitator: 'Facilitator', manager: 'Website Admin' };

// Only what the signed-in person's role would really see
function getLinks(user) {
  const links = [];
  if (user.role === 'student') {
    links.push(
      user.programId
        ? { view: 'student', label: 'My Dashboard', icon: 'bx-grid-alt', match: ['student'] }
        : { view: 'join', label: 'Enter Access Code', icon: 'bx-key', match: ['join'] }
    );
  }
  if (user.role === 'facilitator') {
    links.push({ view: 'facilitator', label: 'My Program', icon: 'bx-chalkboard', match: ['facilitator', 'program-create'] });
  }
  if (user.role === 'manager') {
    links.push({ view: 'manager', label: 'Admin Portal', icon: 'bx-shield-quarter', match: ['manager'] });
  }
  links.push({ view: 'public', label: 'Public Directory', icon: 'bx-globe', match: ['public'] });
  links.push({ view: 'about', label: 'About', icon: 'bx-info-circle', match: ['about'] });
  return links;
}

// Open/close with an exit animation
function usePopover() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const timer = useRef(null);
  const ref = useRef(null);

  const close = () => {
    setOpen(false);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMounted(false), 130);
  };
  const show = () => {
    clearTimeout(timer.current);
    setMounted(true);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) close(); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => () => clearTimeout(timer.current), []);

  return { open, mounted, ref, toggle: () => (open ? close() : show()), close };
}

export default function Navbar({ currentView, setCurrentView, currentUser, onOpenAuth, onOpenSettings, onSignOut }) {
  const signedIn = currentUser && currentUser.role !== 'guest';
  const links = getLinks(currentUser || { role: 'guest' });
  const account = usePopover();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const go = (view) => {
    setDrawerOpen(false);
    setCurrentView(view);
  };

  const isActive = (l) => l.match.includes(currentView);

  return (
    <header className="navbar-header">
      <div className="container navbar-inner">
        {/* Brand */}
        <div className="brand-wrapper" onClick={() => go('landing')} role="link" tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') go('landing'); }}>
          <div className="brand-logo-mark"><i className='bx bx-microchip'></i></div>
          <span className="brand-name">EQUIP</span>
        </div>

        {/* Desktop links */}
        <nav className="nav-desktop-only" aria-label="Main">
          {links.map(l => (
            <button
              key={l.view}
              type="button"
              className={`nav-item-btn ${isActive(l) ? 'active' : ''}`}
              onClick={() => go(l.view)}
              aria-current={isActive(l) ? 'page' : undefined}
            >
              <i className={`bx ${l.icon}`}></i>
              <span>{l.label}</span>
            </button>
          ))}
        </nav>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button type="button" className="btn btn-secondary btn-icon" onClick={onOpenSettings} aria-label="Preferences" title="Preferences">
            <i className='bx bx-cog' style={{ fontSize: '1.15rem' }}></i>
          </button>

          {!signedIn && (
            <button type="button" className="btn btn-primary" onClick={onOpenAuth}>
              <i className='bx bx-log-in'></i>
              <span>Log In</span>
            </button>
          )}

          {signedIn && (
            <div ref={account.ref} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={account.toggle}
                aria-haspopup="menu"
                aria-expanded={account.open}
                className="nav-item-btn"
                style={{ padding: '0.25rem 0.5rem 0.25rem 0.3rem', gap: '0.5rem' }}
              >
                <img
                  src={currentUser.avatar}
                  alt=""
                  style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                />
                <span className="nav-desktop-only" style={{ fontWeight: 600 }}>{currentUser.name?.split(' ')[0]}</span>
                <i className={`bx bx-chevron-down dropdown-caret ${account.open ? 'is-open' : ''}`}></i>
              </button>

              {account.mounted && (
                <div className="nav-popover" role="menu" data-state={account.open ? 'open' : 'closed'}>
                  <div style={{ padding: '0.6rem 0.75rem 0.7rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.25rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{currentUser.name}</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{currentUser.email}</div>
                    <span className="status-badge badge-draft" style={{ marginTop: '0.4rem' }}>
                      {ROLE_LABEL[currentUser.role] || currentUser.role}
                    </span>
                  </div>
                  <button type="button" role="menuitem" className="dropdown-item" onClick={() => { account.close(); onOpenSettings(); }}>
                    <span><i className='bx bx-cog' style={{ marginRight: '0.5rem' }}></i>Preferences</span>
                  </button>
                  <button type="button" role="menuitem" className="dropdown-item" onClick={() => { account.close(); onSignOut(); }}>
                    <span><i className='bx bx-log-out' style={{ marginRight: '0.5rem' }}></i>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile menu button */}
          <button type="button" className="btn btn-secondary btn-icon nav-mobile-only" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
            <i className='bx bx-menu' style={{ fontSize: '1.3rem' }}></i>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="mobile-drawer">
          <div className="mobile-drawer-backdrop" onClick={() => setDrawerOpen(false)}></div>
          <div className="mobile-drawer-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="brand-name">EQUIP</span>
              <button type="button" className="btn btn-secondary btn-icon" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
                <i className='bx bx-x' style={{ fontSize: '1.25rem' }}></i>
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {links.map(l => (
                <button
                  key={l.view}
                  type="button"
                  className={`nav-item-btn ${isActive(l) ? 'active' : ''}`}
                  style={{ justifyContent: 'flex-start', padding: '0.65rem 0.75rem' }}
                  onClick={() => go(l.view)}
                >
                  <i className={`bx ${l.icon}`}></i>
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
            {!signedIn && (
              <button type="button" className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => { setDrawerOpen(false); onOpenAuth(); }}>
                <i className='bx bx-log-in'></i><span>Log In</span>
              </button>
            )}
            {signedIn && (
              <button type="button" className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => { setDrawerOpen(false); onSignOut(); }}>
                <i className='bx bx-log-out'></i><span>Sign out</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}