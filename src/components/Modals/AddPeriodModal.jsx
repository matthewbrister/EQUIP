import React, { useState, useEffect } from 'react';

export default function AddPeriodModal({ isOpen, onClose, onAdd }) {
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    // Start fresh every time it opens
    useEffect(() => {
        if (isOpen) {
            setName('');
            setError('');
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return undefined;
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const res = onAdd(name);
        if (res.success) onClose();
        else setError(res.message);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-dialog" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <i className='bx bx-time-five' style={{ fontSize: '1.3rem', color: 'var(--color-primary)' }}></i>
                        <div>
                            <h3 className="modal-title">Add Class Period</h3>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Organize students and tag projects</p>
                        </div>
                    </div>
                    <button type="button" className="btn btn-secondary btn-icon" onClick={onClose} aria-label="Close">
                        <i className='bx bx-x' style={{ fontSize: '1.25rem' }}></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                    <div className="modal-body">
                        {error && (
                            <div className="alert-box alert-danger" role="alert">
                                <i className='bx bx-error-circle'></i>
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label form-label-required" htmlFor="period-name">Period name</label>
                            <input
                                id="period-name"
                                type="text"
                                className="form-input"
                                placeholder="e.g. Period 3"
                                value={name}
                                onChange={(e) => { setName(e.target.value); setError(''); }}
                                maxLength={40}
                                autoFocus
                            />
                            <div className="form-help-text">Only you can see class periods.</div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
                            <i className='bx bx-plus'></i> Add Period
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}