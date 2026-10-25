import React, { useState } from 'react';
import Dropdown from '../Dropdown';

const PRESET_PHOTOS = [
  { label: '3D Printer', url: 'https://images.unsplash.com/photo-1631541909061-71e349d1f203?w=800&auto=format&fit=crop&q=80' },
  { label: 'Camera', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80' },
  { label: 'Workstation', url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80' },
  { label: 'Embroidery', url: 'https://images.unsplash.com/photo-1605289982774-9a6fef564df8?w=800&auto=format&fit=crop&q=80' },
  { label: 'Laser', url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80' }
];

export default function AddTechModal({ isOpen, onClose, onAdd }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('3D Printing & Fabrication');
  const [status, setStatus] = useState('working');
  const [assetNumber, setAssetNumber] = useState('');
  const [photo, setPhoto] = useState(PRESET_PHOTOS[0].url);
  const [note, setNote] = useState('');
  const [hasSensitiveData, setHasSensitiveData] = useState(false);
  const [dataLocation, setDataLocation] = useState('');
  const [manualUrl, setManualUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      name,
      category,
      status,
      assetNumber: assetNumber || `ASSET-${Math.floor(100 + Math.random() * 900)}`,
      photo,
      note,
      hasSensitiveData,
      dataLocation: hasSensitiveData ? (dataLocation || 'Internal project directory') : 'None',
      manualUrl
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className='bx bx-microchip' style={{ fontSize: '1.3rem', color: 'var(--color-primary)' }}></i>
            <div>
              <h3 className="modal-title">Add Technology</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Catalog lab hardware or tools</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose} aria-label="Close">
            <i className='bx bx-x' style={{ fontSize: '1.25rem' }}></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label form-label-required">Equipment Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Prusa MK4 3D Printer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Asset Tag #</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 3DP-01"
                  value={assetNumber}
                  onChange={(e) => setAssetNumber(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Category</label>
                <Dropdown
                  value={category}
                  onChange={setCategory}
                  options={[
                    { value: "3D Printing & Fabrication", label: "3D Printing & Fabrication" },
                    { value: "Media Production", label: "Media Production" },
                    { value: "Computing & VR", label: "Computing & VR" },
                    { value: "Textiles & Soft Goods", label: "Textiles & Embroidery" },
                    { value: "Aviation & Mapping", label: "Aviation & Mapping" },
                    { value: "Electronics & Robotics", label: "Electronics & Robotics" }
                  ]}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Operational Status</label>
                <Dropdown
                  value={status}
                  onChange={setStatus}
                  options={[
                    { value: "working", label: "Working" },
                    { value: "needs-repairs", label: "Needs Repairs" },
                    { value: "maintenance", label: "Maintenance" },
                    { value: "offline", label: "Offline" }
                  ]}
                />
              </div>
            </div>

            {/* Sensitive Project Data Safeguard */}
            <div style={{
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              marginBottom: '1rem',
              border: '1px solid var(--border-subtle)'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={hasSensitiveData}
                  onChange={(e) => setHasSensitiveData(e.target.checked)}
                />
                <i className='bx bx-shield-quarter' style={{ color: 'var(--color-warning)' }}></i>
                Flag: Contains sensitive project data that must NOT be erased
              </label>

              {hasSensitiveData && (
                <div style={{ marginTop: '0.75rem' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Storage Location / Directory Path</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. SD Card Slot 2: /DCIM/102DOCUMENTARY or D:\EAST_VR_Lab\"
                    value={dataLocation}
                    onChange={(e) => setDataLocation(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Handling Note</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Important handling instructions or checkout notes..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Digital Manual Link (URL)</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://manufacturer.com/manual.pdf"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Technology
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}