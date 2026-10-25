import React from 'react';
import { equipStore } from '../data/store';

export default function Footer({ onOpenSettings }) {
  return (
    <footer className="minimal-footer">
      <div className="container">
        <div className="minimal-footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>EQUIP</span>
            <span>•</span>
            <span>EAST Quick Utility & Inventory Platform</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              type="button"
              onClick={onOpenSettings}
              style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <i className='bx bx-cog'></i>
              <span>Preferences</span>
            </button>

            <button 
              type="button"
              onClick={() => {
                if (window.confirm("Restore sample default data?")) {
                  equipStore.resetToDefault();
                  window.location.reload();
                }
              }}
              style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <i className='bx bx-reset'></i>
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
