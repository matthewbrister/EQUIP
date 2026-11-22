import React, { useState } from 'react';
import { equipStore } from '../data/store';
import { uploadImage } from '../lib/cloudinary';

export default function ProgramCreateView({ currentUser, setCurrentView }) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [campusRoomNumber, setCampusRoomNumber] = useState('');
  const [facilitatorEmail, setFacilitatorEmail] = useState(currentUser.email || '');
  const [facilitatorPhone, setFacilitatorPhone] = useState('');
  const [facilitatorOfficeHours, setFacilitatorOfficeHours] = useState('Mon-Thu 8:00 AM - 4:15 PM');
  const [description, setDescription] = useState('');
  const [showTechnologyPublicly, setShowTechnologyPublicly] = useState(false);
  const [showProjectsPublicly, setShowProjectsPublicly] = useState(false);
  const [photo, setPhoto] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      const created = await equipStore.createProgram({
        name, location, campusRoomNumber, facilitatorEmail, facilitatorPhone,
        facilitatorOfficeHours, description, photo, showTechnologyPublicly, showProjectsPublicly
      }, currentUser);
      if (created?.id) setCurrentView('facilitator');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError('');
    setIsUploadingPhoto(true);
    try {
      setPhoto(await uploadImage(file));
    } catch (error) {
      setPhotoError(error.message);
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem', maxWidth: '720px' }}>
      <button
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.25rem' }}
        onClick={() => setCurrentView('facilitator')}
      >
        <i className='bx bx-arrow-back'></i> Back to Dashboard
      </button>

      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Create New EAST Program</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            Set up your lab directory profile and generate student access codes.
          </p>
        </div>

        <div className="alert-box alert-info">
          <i className='bx bx-info-circle' style={{ fontSize: '1.2rem' }}></i>
          <div style={{ fontSize: '0.82rem' }}>
            <strong>Manager Review:</strong> New programs are saved as <strong>Draft</strong> until verified by Website Managers. You can immediately catalog hardware while review is completed.
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label form-label-required">Program / School Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Bentonville West High EAST"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label form-label-required">Location / District</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Centerton, AR"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label form-label-required">Campus Room Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Building B, Room 402"
                value={campusRoomNumber}
                onChange={(e) => setCampusRoomNumber(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Program Mission / Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Briefly describe your EAST lab focus..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Program Image</label>
            <input type="file" className="form-input" accept="image/*" onChange={handlePhotoChange} disabled={isUploadingPhoto} />
            {isUploadingPhoto && <div className="form-help-text">Uploading image…</div>}
            {photoError && <div className="form-help-text" role="alert" style={{ color: 'var(--color-danger)' }}>{photoError}</div>}
            {photo && <img src={photo} alt="Program preview" style={{ width: 180, height: 110, objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginTop: '0.5rem' }} />}
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label form-label-required">Contact Email</label>
              <input
                type="email"
                className="form-input"
                value={facilitatorEmail}
                onChange={(e) => setFacilitatorEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                className="form-input"
                placeholder="(479) 555-0198"
                value={facilitatorPhone}
                onChange={(e) => setFacilitatorPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Office Hours</label>
            <input
              type="text"
              className="form-input"
              value={facilitatorOfficeHours}
              onChange={(e) => setFacilitatorOfficeHours(e.target.value)}
            />
          </div>

          <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', marginBottom: '1rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.15rem' }}>Public Directory Visibility</div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
              Both are private by default. You can change this anytime in Program Details.
            </p>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '0.4rem' }}>
              <input type="checkbox" checked={showTechnologyPublicly} onChange={(e) => setShowTechnologyPublicly(e.target.checked)} />
              Show technology inventory on the public profile
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={showProjectsPublicly} onChange={(e) => setShowProjectsPublicly(e.target.checked)} />
              Show approved student projects on the public profile
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCurrentView('facilitator')}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving || isUploadingPhoto}>
              {isSaving ? 'Saving…' : 'Submit Program Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}