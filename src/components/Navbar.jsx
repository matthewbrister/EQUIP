import React, { useState, useRef, useEffect } from 'react';
import { equipStore } from '../data/store';
import { DEMO_USERS } from '../data/mockData';

export default function Navbar({ 
  currentView, 
  setCurrentView, 
  currentUser, 
  onOpenAuth,
  onOpenSettings 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRoleSelect = (roleKey) => {
    equipStore.switchRole(roleKey);
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    if (roleKey === 'facilitatorApproved' || roleKey === 'facilitatorPending') {
      setCurrentView('facilitator');
    } else if (roleKey === 'studentJoined') {
      setCurrentView('student');
    } else if (roleKey === 'studentNew') {
      setCurrentView('join');
    } else if (roleKey === 'manager') {
      setCurrentView('manager');
    }
  };

  const navItems = [
    { id: 'landing', label: 'Overview', icon: 'bx-home-alt' },
    { id: 'facilitator', label: 'Facilitator Hub', icon: 'bx-chalkboard' },
    { id: 'student', label: 'Student Space', icon: 'bx-folder' },
    { id: 'join', label: 'Access Code', icon: 'bx-key' },
    { id: 'public', label: 'Directory', icon: 'bx-globe' },
    { id: 'manager', label: 'Admin', icon: 'bx-shield-quarter' }
  ];

  return (
    <header className="navbar-header">
      <div className="container">
        <div className="navbar-inner">
          {/* Brand */}
          <div 
            className="brand-wrapper" 
            onClick={() => setCurrentView('landing')}
          >
            <div className="brand-logo-mark">
              <i className='bx bx-layer'></i>
            </div>
            <span className="brand-name">EQUIP</span>
            <span className="brand-tag-east">EAST</span>
          </div>

          {/* Desktop Nav Items */}
          <nav className="desktop-nav-items" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {navItems.map(item => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  className={`nav-item-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setCurrentView(item.id)}
                >
                  <i className={`bx ${item.icon}`} style={{ fontSize: '1.1rem' }}></i>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Settings + User Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Preferences / Customization Button */}
            <button 
              className="btn btn-secondary btn-icon"
              onClick={onOpenSettings}
              title="Preferences & Customization"
              aria-label="Settings"
            >
              <i className='bx bx-cog' style={{ fontSize: '1.25rem' }}></i>
            </button>

            {/* User Dropdown */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                className="btn btn-secondary"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  padding: '0.35rem 0.65rem',
                  gap: '0.5rem',
                  fontSize: '0.85rem'
                }}
              >
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <span style={{ fontWeight: 600 }}>{currentUser.name.split(' ')[0]}</span>
                <i className={`bx ${userDropdownOpen ? 'bx-chevron-up' : 'bx-chevron-down'}`}></i>
              </button>

              {userDropdownOpen && (
                <div 
                  className="card"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    right: 0,
                    width: '240px',
                    padding: '0.5rem',
                    zIndex: 200,
                    boxShadow: 'var(--shadow-lg)'
                  }}
                >
                  <div style={{ padding: '0.5rem 0.65rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.35rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{currentUser.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentUser.email}</div>
                  </div>

                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0.25rem 0.65rem' }}>
                    Switch Account Role
                  </div>

                  <button 
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start', border: 'none', background: 'transparent' }}
                    onClick={() => handleRoleSelect('facilitatorApproved')}
                  >
                    <i className='bx bx-check-circle'></i> Facilitator (Approved)
                  </button>

                  <button 
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start', border: 'none', background: 'transparent' }}
                    onClick={() => handleRoleSelect('facilitatorPending')}
                  >
                    <i className='bx bx-time'></i> Facilitator (Pending)
                  </button>

                  <button 
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start', border: 'none', background: 'transparent' }}
                    onClick={() => handleRoleSelect('studentJoined')}
                  >
                    <i className='bx bx-user'></i> Student (Enrolled)
                  </button>

                  <button 
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start', border: 'none', background: 'transparent' }}
                    onClick={() => handleRoleSelect('studentNew')}
                  >
                    <i className='bx bx-key'></i> Student (New - Code)
                  </button>

                  <button 
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start', border: 'none', background: 'transparent' }}
                    onClick={() => handleRoleSelect('manager')}
                  >
                    <i className='bx bx-shield-quarter'></i> Website Manager
                  </button>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '0.35rem', paddingTop: '0.35rem' }}>
                    <button 
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start', border: 'none', background: 'transparent' }}
                      onClick={() => { setUserDropdownOpen(false); onOpenAuth(); }}
                    >
                      <i className='bx bx-info-circle'></i> Google OAuth Info
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Toggle */}
            <button 
              className="btn btn-secondary btn-icon mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(true)}
              style={{ display: 'none' }}
              aria-label="Open menu"
            >
              <i className='bx bx-menu' style={{ fontSize: '1.25rem' }}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <div className="mobile-drawer-backdrop" onClick={() => setMobileMenuOpen(false)} />
          <div className="mobile-drawer-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div className="brand-wrapper" onClick={() => { setCurrentView('landing'); setMobileMenuOpen(false); }}>
                <div className="brand-logo-mark">
                  <i className='bx bx-layer'></i>
                </div>
                <span className="brand-name">EQUIP</span>
              </div>
              <button className="btn btn-secondary btn-icon" onClick={() => setMobileMenuOpen(false)}>
                <i className='bx bx-x' style={{ fontSize: '1.25rem' }}></i>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
              {navItems.map(item => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    className={`nav-item-btn ${isActive ? 'active' : ''}`}
                    style={{ padding: '0.65rem 0.85rem' }}
                    onClick={() => {
                      setCurrentView(item.id);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <i className={`bx ${item.icon}`} style={{ fontSize: '1.15rem' }}></i>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
              <button 
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', marginBottom: '0.5rem', justifyContent: 'flex-start' }}
                onClick={() => { setMobileMenuOpen(false); onOpenSettings(); }}
              >
                <i className='bx bx-cog'></i>
                <span>Preferences & Layout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 820px) {
          .desktop-nav-items {
            display: none !important;
          }
          .mobile-menu-toggle {
            display: inline-flex !important;
          }
        }
      `}</style>
    </header>
  );
}
