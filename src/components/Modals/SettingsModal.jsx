import React, { useState, useEffect } from 'react';
import { equipStore } from '../../data/store';

export default function SettingsModal({ isOpen, onClose }) {
  const [settings, setSettings] = useState(equipStore.getSettings());

  useEffect(() => {
    if (isOpen) {
      setSettings(equipStore.getSettings());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpdate = (key, value) => {
    const updated = equipStore.updateSettings({ [key]: value });
    setSettings(updated);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <i className='bx bx-cog' style={{ fontSize: '1.4rem', color: 'var(--color-primary)' }}></i>
            <div>
              <h3 className="modal-title" style={{ fontSize: '1.15rem' }}>Preferences & Layout</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Customize themes, density, and interface appearance</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose} aria-label="Close">
            <i className='bx bx-x' style={{ fontSize: '1.25rem' }}></i>
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Theme Mode */}
          <div>
            <label className="form-label" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <i className='bx bx-sun' style={{ fontSize: '1.1rem' }}></i> Interface Theme
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                className={`btn ${settings.theme === 'light' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ justifyContent: 'center' }}
                onClick={() => handleUpdate('theme', 'light')}
              >
                <i className='bx bx-sun'></i> Light
              </button>
              <button
                type="button"
                className={`btn ${settings.theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ justifyContent: 'center' }}
                onClick={() => handleUpdate('theme', 'dark')}
              >
                <i className='bx bx-moon'></i> Dark
              </button>
            </div>
          </div>

          {/* Accent Color */}
          <div>
            <label className="form-label" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <i className='bx bx-palette' style={{ fontSize: '1.1rem' }}></i> Accent Palette
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {[
                { id: 'blue', label: 'Blue', color: settings.theme === 'dark' ? '#60a5fa' : '#2563eb' },
                { id: 'slate', label: 'Slate', color: settings.theme === 'dark' ? '#e5e5e5' : '#475569' },
                { id: 'teal', label: 'Teal', color: settings.theme === 'dark' ? '#2dd4bf' : '#0d9488' },
                { id: 'indigo', label: 'Indigo', color: settings.theme === 'dark' ? '#818cf8' : '#4f46e5' }
              ].map(acc => (
                <button
                  key={acc.id}
                  type="button"
                  className="btn btn-secondary"
                  style={{
                    padding: '0.5rem 0.25rem',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    border: settings.accent === acc.id ? '2px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                    background: settings.accent === acc.id ? 'var(--bg-subtle)' : 'var(--bg-surface)'
                  }}
                  onClick={() => handleUpdate('accent', acc.id)}
                >
                  <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: acc.color, display: 'inline-block' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{acc.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Layout Density */}
          <div>
            <label className="form-label" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <i className='bx bx-layout' style={{ fontSize: '1.1rem' }}></i> Layout Density
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                className={`btn ${settings.density === 'comfortable' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ justifyContent: 'center' }}
                onClick={() => handleUpdate('density', 'comfortable')}
              >
                <i className='bx bx-menu'></i> Comfortable
              </button>
              <button
                type="button"
                className={`btn ${settings.density === 'compact' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ justifyContent: 'center' }}
                onClick={() => handleUpdate('density', 'compact')}
              >
                <i className='bx bx-grid-alt'></i> Compact
              </button>
            </div>
          </div>

          {/* Card Presentation Style */}
          <div>
            <label className="form-label" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <i className='bx bx-card' style={{ fontSize: '1.1rem' }}></i> Card Style
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                className={`btn ${settings.cardStyle === 'bordered' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ justifyContent: 'center' }}
                onClick={() => handleUpdate('cardStyle', 'bordered')}
              >
                Bordered
              </button>
              <button
                type="button"
                className={`btn ${settings.cardStyle === 'flat' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ justifyContent: 'center' }}
                onClick={() => handleUpdate('cardStyle', 'flat')}
              >
                Minimal Flat
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}