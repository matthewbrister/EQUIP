import React, { useState } from 'react';
import Dropdown from '../Dropdown';

const PRESET_PROJECT_PHOTOS = [
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80'
];

export default function NewProjectModal({ isOpen, onClose, onAdd, studentUser }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('GIS & Community Service');
  const [description, setDescription] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(PRESET_PROJECT_PHOTOS[0]);

  // Team members
  const [teamMembers, setTeamMembers] = useState([
    { name: studentUser?.name || 'My Name', role: 'Team Lead', grade: studentUser?.grade || '11th' }
  ]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberGrade, setNewMemberGrade] = useState('11th');

  // Past project handlers
  const [pastHandlers, setPastHandlers] = useState([]);
  const [newHandlerText, setNewHandlerText] = useState('');

  // Communication logs
  const [commLogs, setCommLogs] = useState([]);
  const [logContact, setLogContact] = useState('');
  const [logType, setLogType] = useState('Partner Meeting');
  const [logNotes, setLogNotes] = useState('');

  if (!isOpen) return null;

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    setTeamMembers([
      ...teamMembers,
      { name: newMemberName.trim(), role: newMemberRole.trim() || 'Contributor', grade: newMemberGrade }
    ]);
    setNewMemberName('');
    setNewMemberRole('');
  };

  const handleRemoveMember = (idx) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== idx));
  };

  const handleAddPastHandler = () => {
    if (!newHandlerText.trim()) return;
    setPastHandlers([...pastHandlers, newHandlerText.trim()]);
    setNewHandlerText('');
  };

  const handleRemovePastHandler = (idx) => {
    setPastHandlers(pastHandlers.filter((_, i) => i !== idx));
  };

  const handleAddCommLog = () => {
    if (!logContact.trim() || !logNotes.trim()) return;
    setCommLogs([
      ...commLogs,
      {
        date: new Date().toISOString().split('T')[0],
        author: studentUser?.name || 'Student',
        contactPerson: logContact.trim(),
        type: logType,
        notes: logNotes.trim()
      }
    ]);
    setLogContact('');
    setLogNotes('');
  };

  const handleRemoveCommLog = (idx) => {
    setCommLogs(commLogs.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      name,
      category,
      description,
      photos: [selectedPhoto],
      teamMembers,
      pastProjectHandlers: pastHandlers,
      communicationLogs: commLogs,
      externalLinks: []
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-dialog-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className='bx bx-folder-plus' style={{ fontSize: '1.3rem', color: 'var(--color-primary)' }}></i>
            <div>
              <h3 className="modal-title">Upload Project</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Draft proposal for facilitator review</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose} aria-label="Close">
            <i className='bx bx-x' style={{ fontSize: '1.25rem' }}></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body">
            <div className="alert-box alert-info">
              <i className='bx bx-info-circle'></i>
              <div style={{ fontSize: '0.82rem' }}>
                Submissions are saved as <strong>Draft</strong> and will be published once approved by your facilitator.
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label form-label-required">Project Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ozark Trail LiDAR Map"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <Dropdown
                  value={category}
                  onChange={setCategory}
                  options={[
                    { value: "GIS & Community Service", label: "GIS & Community Service" },
                    { value: "Engineering & Architecture", label: "Engineering & Architecture" },
                    { value: "Software & Virtual Reality", label: "Software & Virtual Reality" },
                    { value: "Media & Storytelling", label: "Media & Storytelling" },
                    { value: "Assistive Technology", label: "Assistive Technology" }
                  ]}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label form-label-required">Description & Community Problem</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="What problem does this project solve for the community?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Team Members */}
            <div style={{ background: 'var(--bg-subtle)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>Team Members</div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.5rem' }}>
                {teamMembers.map((m, idx) => (
                  <span
                    key={idx}
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    {m.name} ({m.role})
                    {teamMembers.length > 1 && (
                      <button type="button" onClick={() => handleRemoveMember(idx)} style={{ color: 'var(--color-danger)' }}>
                        <i className='bx bx-x'></i>
                      </button>
                    )}
                  </span>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr auto', gap: '0.4rem', alignItems: 'center' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Student Name"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  style={{ fontSize: '0.82rem' }}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Role"
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  style={{ fontSize: '0.82rem' }}
                />
                <Dropdown
                  value={newMemberGrade}
                  onChange={setNewMemberGrade}
                  style={{ fontSize: '0.82rem' }}
                  options={[
                    { value: "9th", label: "9th" },
                    { value: "10th", label: "10th" },
                    { value: "11th", label: "11th" },
                    { value: "12th", label: "12th" }
                  ]}
                />
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddMember}>
                  Add
                </button>
              </div>
            </div>

            {/* Past Handlers */}
            <div style={{ background: 'var(--bg-subtle)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>Past Project Handlers (Alumni)</div>
              {pastHandlers.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.5rem' }}>
                  {pastHandlers.map((h, idx) => (
                    <span key={idx} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      {h}
                      <button type="button" onClick={() => handleRemovePastHandler(idx)} style={{ color: 'var(--color-danger)' }}>
                        <i className='bx bx-x'></i>
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Jordan Vance (Class of '25 - Initial GIS mapping)"
                  value={newHandlerText}
                  onChange={(e) => setNewHandlerText(e.target.value)}
                  style={{ fontSize: '0.82rem' }}
                />
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddPastHandler}>
                  Add
                </button>
              </div>
            </div>

            {/* Communication Logs */}
            <div style={{ background: 'var(--bg-subtle)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>Client / Partner Communication Log</div>
              {commLogs.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.5rem' }}>
                  {commLogs.map((log, idx) => (
                    <div key={idx} style={{ background: 'var(--bg-surface)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.78rem' }}>
                      <strong>{log.contactPerson}</strong> ({log.type}): {log.notes}
                      <button type="button" onClick={() => handleRemoveCommLog(idx)} style={{ float: 'right', color: 'var(--color-danger)' }}>
                        <i className='bx bx-x'></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '0.4rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Partner Name"
                  value={logContact}
                  onChange={(e) => setLogContact(e.target.value)}
                  style={{ fontSize: '0.82rem' }}
                />
                <Dropdown
                  value={logType}
                  onChange={setLogType}
                  style={{ fontSize: '0.82rem' }}
                  options={[
                    { value: "Meeting", label: "Meeting" },
                    { value: "Call", label: "Call" },
                    { value: "Email", label: "Email" },
                    { value: "Site Survey", label: "Site Survey" }
                  ]}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Summary of partner feedback or notes..."
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  style={{ fontSize: '0.82rem' }}
                />
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddCommLog}>
                  Add Log
                </button>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Draft
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}