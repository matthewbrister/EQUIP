import React, { useState, useEffect } from 'react';
import { equipStore } from '../../data/store';

export default function SettingsModal({ isOpen, onClose, currentUser, onDeleteAccount }) {
  const [settings, setSettings] = useState(equipStore.getSettings());
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const canDeleteAccount = currentUser?.role === 'student'
    || (currentUser?.role === 'facilitator' && !currentUser.programId);

  useEffect(() => {
    if (isOpen) {
      setSettings(equipStore.getSettings());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isDeleting) return;
    setShowDeleteConfirmation(false);
    setDeleteConfirmation('');
    setDeleteError('');
    onClose();
  };

  const handleUpdate = (key, value) => {
    const updated = equipStore.updateSettings({ [key]: value });
    setSettings(updated);
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError('');
    try {
      await onDeleteAccount();
      setShowDeleteConfirmation(false);
      setDeleteConfirmation('');
      onClose();
    } catch (error) {
      setDeleteError(error.message || 'Account deletion failed. Please try again or contact the administrator.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-dialog" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <i className='bx bx-cog' style={{ fontSize: '1.4rem', color: 'var(--color-primary)' }}></i>
            <div>
              <h3 className="modal-title" style={{ fontSize: '1.15rem' }}>Preferences & Layout</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Customize themes, density, and interface appearance</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={handleClose} aria-label="Close" disabled={isDeleting}>
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

          {(canDeleteAccount || currentUser?.role === 'facilitator') && (
            <section style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.4rem', color: 'var(--color-danger)' }}>Delete account</h4>
              {canDeleteAccount ? (
                <>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                    This permanently deletes your Google sign-in and EQUIP profile, and removes any student roster membership.
                    Your submitted projects, project details, and images will remain in the program workspace.
                  </p>
                  {!showDeleteConfirmation ? (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => setShowDeleteConfirmation(true)}
                    >
                      Delete my account
                    </button>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      <label className="form-label" htmlFor="delete-account-confirmation">
                        Type DELETE to confirm
                      </label>
                      <input
                        id="delete-account-confirmation"
                        type="text"
                        className="form-input"
                        value={deleteConfirmation}
                        onChange={(event) => setDeleteConfirmation(event.target.value)}
                        autoComplete="off"
                        disabled={isDeleting}
                      />
                      {deleteError && <p className="form-help-text" role="alert" style={{ color: 'var(--color-danger)' }}>{deleteError}</p>}
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setShowDeleteConfirmation(false);
                            setDeleteConfirmation('');
                            setDeleteError('');
                          }}
                          disabled={isDeleting}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={handleDeleteAccount}
                          disabled={deleteConfirmation !== 'DELETE' || isDeleting}
                        >
                          {isDeleting ? 'Deleting…' : 'Permanently delete'}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  Facilitators who own a program must contact the administrator to transfer or archive it before deleting their account.
                </p>
              )}
            </section>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={isDeleting}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}