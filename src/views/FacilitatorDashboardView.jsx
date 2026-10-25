import React, { useState } from 'react';
import { equipStore } from '../data/store';
import AddTechModal from '../components/Modals/AddTechModal';
import TechDetailModal from '../components/Modals/TechDetailModal';
import ProjectDetailModal from '../components/Modals/ProjectDetailModal';
import QrCodeModal from '../components/Modals/QrCodeModal';

export default function FacilitatorDashboardView({
  currentUser,
  setCurrentView,
  onSelectRole
}) {
  const [activeTab, setActiveTab] = useState('tech'); // 'tech' | 'projects' | 'settings'
  const [techFilter, setTechFilter] = useState('all');
  const [techSearch, setTechSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');

  // Modals state
  const [isAddTechOpen, setIsAddTechOpen] = useState(false);
  const [selectedTech, setSelectedTech] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const programs = equipStore.getPrograms();
  const currentProgram = programs.find(p => p.id === currentUser.programId) || programs[0];

  const [editName, setEditName] = useState(currentProgram?.name || '');
  const [editLocation, setEditLocation] = useState(currentProgram?.location || '');
  const [editRoom, setEditRoom] = useState(currentProgram?.campusRoomNumber || '');
  const [editEmail, setEditEmail] = useState(currentProgram?.facilitator?.email || '');
  const [editPhone, setEditPhone] = useState(currentProgram?.facilitator?.phone || '');
  const [editHours, setEditHours] = useState(currentProgram?.facilitator?.officeHours || '');
  const [editPhoto, setEditPhoto] = useState(currentProgram?.photo || '');
  const [editShowTech, setEditShowTech] = useState(currentProgram?.showTechnologyPublicly === true);
  const [editShowProjects, setEditShowProjects] = useState(currentProgram?.showProjectsPublicly === true);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // If facilitator is pending approval
  if (currentUser.role === 'facilitator' && currentUser.facilitatorStatus === 'pending') {
    return (
      <div className="container" style={{ padding: '3.5rem 1.25rem', maxWidth: '680px' }}>
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', color: 'var(--color-warning)', marginBottom: '1rem' }}>
            <i className='bx bx-time-five'></i>
          </div>
          <span className="status-badge badge-needs-repairs" style={{ marginBottom: '0.75rem' }}>
            Account Pending Website Manager Approval
          </span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Welcome, {currentUser.name}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            Your facilitator account has been created via Google OAuth 2. Website Managers must verify your credentials before your EAST program can be published.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={() => {
                onSelectRole('manager');
                setCurrentView('manager');
              }}
            >
              <span>Review in Manager Portal</span>
              <i className='bx bx-right-arrow-alt'></i>
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => onSelectRole('facilitatorApproved')}
            >
              <span>Use Approved Facilitator Persona</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If approved facilitator has no program yet
  if (!currentProgram) {
    return (
      <div className="container" style={{ padding: '3.5rem 1.25rem', textAlign: 'center' }}>
        <div className="card" style={{ padding: '2.5rem', maxWidth: '580px', margin: '0 auto' }}>
          <i className='bx bx-building' style={{ fontSize: '2.5rem', color: 'var(--color-primary)', marginBottom: '0.75rem', display: 'inline-block' }}></i>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>No Program Created Yet</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
            Your facilitator account is approved. Create your EAST program to begin cataloging technology.
          </p>
          <button className="btn btn-primary" onClick={() => setCurrentView('program-create')}>
            <i className='bx bx-plus'></i>
            <span>Create EAST Program</span>
          </button>
        </div>
      </div>
    );
  }

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(currentProgram.code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleAddTech = (techInput) => {
    equipStore.addTechnology(currentProgram.id, techInput);
  };

  const handleUpdateTechStatus = (techId, newStatus) => {
    equipStore.updateTechnology(currentProgram.id, techId, { status: newStatus });
  };

  const handleDeleteTech = (techId) => {
    equipStore.deleteTechnology(currentProgram.id, techId);
  };

  const handleApproveProject = (projId) => {
    equipStore.approveProject(currentProgram.id, projId);
  };

  const handleRejectProject = (projId, reason) => {
    equipStore.rejectProject(currentProgram.id, projId, reason);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    equipStore.updateProgram(currentProgram.id, {
      name: editName,
      location: editLocation,
      campusRoomNumber: editRoom,
      photo: editPhoto,
      showTechnologyPublicly: editShowTech,
      showProjectsPublicly: editShowProjects,
      facilitator: {
        ...currentProgram.facilitator,
        email: editEmail,
        phone: editPhone,
        officeHours: editHours
      }
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const techList = currentProgram.technologies || [];
  const filteredTech = techList.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(techSearch.toLowerCase()) ||
      (t.assetNumber && t.assetNumber.toLowerCase().includes(techSearch.toLowerCase())) ||
      t.category.toLowerCase().includes(techSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (techFilter === 'all') return true;
    if (techFilter === 'working') return t.status === 'working';
    if (techFilter === 'needs-repairs') return t.status === 'needs-repairs';
    if (techFilter === 'maintenance') return t.status === 'maintenance';
    if (techFilter === 'sensitive') return t.hasSensitiveData;
    return true;
  });

  const projectList = currentProgram.projects || [];
  const draftProjects = projectList.filter(p => p.status === 'draft');
  const approvedProjects = projectList.filter(p => p.status === 'approved');

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      {/* Draft Program Status Alert */}
      {currentProgram.status === 'draft' && (
        <div className="alert-box alert-warning">
          <i className='bx bx-info-circle' style={{ fontSize: '1.2rem' }}></i>
          <div style={{ flex: 1 }}>
            <strong>Program Status: Draft (Pending Manager Signoff)</strong>
            <p style={{ fontSize: '0.82rem', marginTop: '0.15rem' }}>
              Your program is operational for testing. Public directory listing will appear once signed off by a Website Manager.
            </p>
          </div>
        </div>
      )}

      {/* Program Header (Clean & Uncluttered) */}
      <div data-tour="program-header" className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="brand-tag-east">FACILITATOR</span>
              {currentProgram.status === 'approved' ? (
                <span className="status-badge badge-approved">Live</span>
              ) : (
                <span className="status-badge badge-needs-repairs">Draft</span>
              )}
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{currentProgram.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
              <span><i className='bx bx-map-pin'></i> {currentProgram.campusRoomNumber} • {currentProgram.location}</span>
              <span><i className='bx bx-envelope'></i> {currentProgram.facilitator.email}</span>
            </div>
          </div>

          {/* Secure Access Code Widget */}
          <div data-tour="access-code" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            padding: '0.4rem 0.75rem',
            borderRadius: 'var(--radius-sm)'
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Student Code:
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', letterSpacing: '0.05em' }}>
              {currentProgram.code}
            </span>
            <button
              className="btn btn-secondary btn-icon"
              style={{ width: '28px', height: '28px' }}
              onClick={handleCopyCode}
              title="Copy access code"
            >
              <i className={`bx ${codeCopied ? 'bx-check' : 'bx-copy'}`}></i>
            </button>
            <button
              className="btn btn-secondary btn-icon"
              style={{ width: '28px', height: '28px' }}
              onClick={() => setIsQrModalOpen(true)}
              title="QR code projector"
            >
              <i className='bx bx-qr-scan'></i>
            </button>
            <button
              className="btn btn-secondary btn-icon"
              style={{ width: '28px', height: '28px' }}
              onClick={() => {
                if (window.confirm("Regenerate secure access code?")) {
                  equipStore.regenerateProgramCode(currentProgram.id);
                }
              }}
              title="Regenerate secure code"
            >
              <i className='bx bx-refresh'></i>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'tech' ? 'active' : ''}`}
          onClick={() => setActiveTab('tech')}
        >
          <i className='bx bx-microchip'></i>
          <span>Technology ({techList.length})</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          <i className='bx bx-folder'></i>
          <span>Projects ({projectList.length})</span>
          {draftProjects.length > 0 && (
            <span className="status-badge badge-needs-repairs" style={{ fontSize: '0.7rem' }}>
              {draftProjects.length} Review
            </span>
          )}
        </button>

        <button
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <i className='bx bx-slider'></i>
          <span>Program Details</span>
        </button>
      </div>

      {/* TAB 1: TECHNOLOGY */}
      {activeTab === 'tech' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search technology by name or asset #..."
                value={techSearch}
                onChange={(e) => setTechSearch(e.target.value)}
                style={{ maxWidth: '320px' }}
              />

              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button
                  className={`btn btn-sm ${techFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setTechFilter('all')}
                >
                  All
                </button>
                <button
                  className={`btn btn-sm ${techFilter === 'working' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setTechFilter('working')}
                >
                  Working
                </button>
                <button
                  className={`btn btn-sm ${techFilter === 'needs-repairs' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setTechFilter('needs-repairs')}
                >
                  Repairs
                </button>
                <button
                  className={`btn btn-sm ${techFilter === 'sensitive' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setTechFilter('sensitive')}
                >
                  Sensitive Data
                </button>
              </div>
            </div>

            <button className="btn btn-primary" onClick={() => setIsAddTechOpen(true)}>
              <i className='bx bx-plus'></i>
              <span>Add Technology</span>
            </button>
          </div>

          {filteredTech.length > 0 ? (
            <div className="grid-3">
              {filteredTech.map(tech => (
                <div
                  key={tech.id}
                  className="card"
                  style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                  onClick={() => setSelectedTech(tech)}
                >
                  <div style={{ height: '140px', position: 'relative', background: '#0f172a' }}>
                    <img
                      src={tech.photo}
                      alt={tech.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: '8px', left: '8px' }}>
                      {tech.status === 'working' && <span className="status-badge badge-working">Working</span>}
                      {tech.status === 'needs-repairs' && <span className="status-badge badge-needs-repairs">Repairs</span>}
                      {tech.status === 'maintenance' && <span className="status-badge badge-maintenance">Maintenance</span>}
                      {tech.status === 'offline' && <span className="status-badge badge-offline">Offline</span>}
                    </div>

                    <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600, background: 'rgba(15,23,42,0.85)', color: 'white', padding: '1px 6px', borderRadius: '3px' }}>
                        {tech.assetNumber}
                      </span>
                    </div>

                    {tech.hasSensitiveData && (
                      <div style={{ position: 'absolute', bottom: '6px', left: '6px', right: '6px', background: 'rgba(180, 83, 9, 0.95)', color: 'white', padding: '3px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <i className='bx bx-shield-quarter'></i>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          Do not erase project files
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                        {tech.category}
                      </div>
                      <h3 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                        {tech.name}
                      </h3>
                      {tech.note && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {tech.note}
                        </p>
                      )}
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem', marginTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>{tech.manualUrl ? 'Manual available' : 'No manual'}</span>
                      <span>{tech.lastChecked}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>No equipment matches your filter.</p>
              <button className="btn btn-secondary btn-sm" onClick={() => setTechFilter('all')}>
                Show All
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PROJECTS */}
      {activeTab === 'projects' && (
        <div>
          {/* Pending Reviews */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              Pending Student Submissions ({draftProjects.length})
            </h2>

            {draftProjects.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {draftProjects.map(proj => (
                  <div key={proj.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ flex: 1, minWidth: '260px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                        <span className="status-badge badge-needs-repairs">Draft Review</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{proj.category}</span>
                      </div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.2rem' }}>{proj.name}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{proj.description}</p>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Submitted by <strong>{proj.submittedBy}</strong> on {proj.submissionDate}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedProject(proj)}
                      >
                        Inspect
                      </button>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleApproveProject(proj.id)}
                      >
                        <i className='bx bx-check'></i> Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ padding: '1rem', background: 'var(--bg-subtle)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <i className='bx bx-check-circle' style={{ color: 'var(--color-success)', marginRight: '6px' }}></i>
                All student project drafts have been reviewed.
              </div>
            )}
          </div>

          {/* Approved Projects */}
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              Approved Projects ({approvedProjects.length})
            </h2>

            <div className="grid-2">
              {approvedProjects.map(proj => (
                <div
                  key={proj.id}
                  className="card"
                  style={{ padding: '1rem', cursor: 'pointer' }}
                  onClick={() => setSelectedProject(proj)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{proj.name}</h3>
                    <span className="status-badge badge-approved">Approved</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '0.75rem' }}>
                    {proj.description}
                  </p>
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Lead: {proj.submittedBy}</span>
                    <span>{proj.communicationLogs?.length || 0} Logs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="card" style={{ padding: '1.5rem', maxWidth: '680px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            Program Profile
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Update campus room number, location, and facilitator contact information.
          </p>

          {settingsSaved && (
            <div className="alert-box alert-success">
              <i className='bx bx-check'></i>
              <span>Profile updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings}>
            <div className="form-group">
              <label className="form-label form-label-required">Program Name</label>
              <input
                type="text"
                className="form-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label form-label-required">Location</label>
                <input
                  type="text"
                  className="form-input"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Campus Room #</label>
                <input
                  type="text"
                  className="form-input"
                  value={editRoom}
                  onChange={(e) => setEditRoom(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label form-label-required">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="text"
                  className="form-input"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Office Hours</label>
              <input
                type="text"
                className="form-input"
                value={editHours}
                onChange={(e) => setEditHours(e.target.value)}
              />
            </div>

            <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', marginTop: '0.5rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.15rem' }}>Public Directory Visibility</div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                Choose what visitors can see on your public profile. Students with your access code always see everything.
              </p>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '0.4rem' }}>
                <input type="checkbox" checked={editShowTech} onChange={(e) => setEditShowTech(e.target.checked)} />
                Show technology inventory publicly
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={editShowProjects} onChange={(e) => setEditShowProjects(e.target.checked)} />
                Show approved student projects publicly
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary">
                Save Program Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modals */}
      <AddTechModal
        isOpen={isAddTechOpen}
        onClose={() => setIsAddTechOpen(false)}
        onAdd={handleAddTech}
      />

      <TechDetailModal
        tech={selectedTech}
        isOpen={!!selectedTech}
        onClose={() => setSelectedTech(null)}
        isFacilitator={true}
        onUpdateStatus={handleUpdateTechStatus}
        onDelete={handleDeleteTech}
      />

      <ProjectDetailModal
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        isFacilitator={true}
        onApprove={handleApproveProject}
        onReject={handleRejectProject}
      />

      <QrCodeModal
        program={currentProgram}
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />
    </div>
  );
}