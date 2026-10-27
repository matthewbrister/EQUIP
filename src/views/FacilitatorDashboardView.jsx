import React, { useState } from 'react';
import { equipStore, avatarFor } from '../data/store';
import AddTechModal from '../components/Modals/AddTechModal';
import TechDetailModal from '../components/Modals/TechDetailModal';
import ProjectDetailModal from '../components/Modals/ProjectDetailModal';
import QrCodeModal from '../components/Modals/QrCodeModal';
import Dropdown from '../components/Dropdown';
import AddPeriodModal from '../components/Modals/AddPeriodModal';

export default function FacilitatorDashboardView({
  currentUser,
  setCurrentView,
  onSelectRole,
  onSignOut
}) {
  const [activeTab, setActiveTab] = useState('tech'); // 'tech' | 'projects' | 'roster' | 'settings'
  const [techFilter, setTechFilter] = useState('all');
  const [techSearch, setTechSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');

  // Roster & class periods
  const [periodModalOpen, setPeriodModalOpen] = useState(false);
  const [collapsed, setCollapsed] = useState({}); // period id (or 'unassigned') -> true when collapsed
  const [periodError, setPeriodError] = useState('');
  const [editingPeriodId, setEditingPeriodId] = useState(null);
  const [editingPeriodName, setEditingPeriodName] = useState('');
  const [projectPeriodFilter, setProjectPeriodFilter] = useState('all');

  // Modals state
  const [isAddTechOpen, setIsAddTechOpen] = useState(false);
  const [selectedTech, setSelectedTech] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const programs = equipStore.getPrograms();
  const currentProgram = programs.find(p => p.id === currentUser.programId);

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
  if (currentUser.role === 'facilitator' && ['pending', 'rejected'].includes(currentUser.facilitatorStatus)) {
    const rejected = currentUser.facilitatorStatus === 'rejected';
    return (
      <div className="container" style={{ padding: '3.5rem 1.25rem', maxWidth: '680px' }}>
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', color: 'var(--color-warning)', marginBottom: '1rem' }}>
            <i className='bx bx-time-five'></i>
          </div>
          <span className={`status-badge ${rejected ? 'badge-offline' : 'badge-needs-repairs'}`} style={{ marginBottom: '0.75rem' }}>
            {rejected ? 'Account Not Approved' : 'Account Pending Website Manager Approval'}
          </span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Welcome, {currentUser.name}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            {rejected
              ? 'A website manager was not able to approve this facilitator account. Please contact your EAST network administrator.'
              : 'Your facilitator account has been created. A website manager must verify your credentials before you can create a program and generate student access codes. You can sign in again later to check your status.'}
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={onSignOut}>
              <i className='bx bx-log-out'></i>
              <span>Sign Out</span>
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
            Your facilitator account is approved. Create your EAST program to begin cataloging technology and to get your student access code.
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

  const periods = currentProgram.periods || [];
  const roster = currentProgram.roster || [];
  const periodName = (id) => periods.find(p => p.id === id)?.name;

  const projectList = currentProgram.projects || [];
  const pendingCount = projectList.filter(p => p.status === 'draft').length;
  const matchesPeriod = (p) => {
    if (projectPeriodFilter === 'all') return true;
    if (projectPeriodFilter === 'untagged') return !(p.periodIds && p.periodIds.length);
    return (p.periodIds || []).includes(projectPeriodFilter);
  };
  const draftProjects = projectList.filter(p => p.status === 'draft' && matchesPeriod(p));
  const approvedProjects = projectList.filter(p => p.status === 'approved' && matchesPeriod(p));
  const liveSelectedProject = selectedProject ? projectList.find(p => p.id === selectedProject.id) || null : null;

  const studentsIn = (periodId) => roster.filter(r => r.periodId === periodId && periodName(periodId));
  const unassignedStudents = roster.filter(r => !r.periodId || !periodName(r.periodId));
  const savedAccounts = equipStore.getAccounts();
  const avatarOf = (s) => s.avatar || savedAccounts.find(a => a.id === s.studentId)?.avatar || avatarFor(s.name);

  const handleAddPeriod = (name) => equipStore.addPeriod(currentProgram.id, name);

  const handleSaveRename = (periodId) => {
    const res = equipStore.renamePeriod(currentProgram.id, periodId, editingPeriodName);
    if (res.success) {
      setEditingPeriodId(null);
      setPeriodError('');
    } else {
      setPeriodError(res.message);
    }
  };

  const handleDeletePeriod = (per) => {
    if (window.confirm(`Delete "${per.name}"? Students in it become unassigned and the tag is removed from projects.`)) {
      equipStore.deletePeriod(currentProgram.id, per.id);
      if (projectPeriodFilter === per.id) setProjectPeriodFilter('all');
    }
  };

  const handleRemoveStudent = (student) => {
    if (window.confirm(`Remove ${student.name} from your roster? They will need to enter an access code to rejoin.`)) {
      equipStore.removeStudentFromRoster(currentProgram.id, student.studentId);
    }
  };

  const toggleCollapsed = (id) => setCollapsed(c => ({ ...c, [id]: !c[id] }));
  const sectionIds = [...periods.map(p => p.id), ...(unassignedStudents.length > 0 ? ['unassigned'] : [])];
  const allCollapsed = sectionIds.length > 0 && sectionIds.every(id => collapsed[id]);
  const toggleAll = () => setCollapsed(Object.fromEntries(sectionIds.map(id => [id, !allCollapsed])));

  // Smoothly animated collapsible body
  const renderCollapsible = (id, children) => (
    <div style={{ display: 'grid', gridTemplateRows: collapsed[id] ? '0fr' : '1fr', transition: 'grid-template-rows 220ms ease' }}>
      <div
        style={{
          overflow: 'hidden',
          minHeight: 0,
          visibility: collapsed[id] ? 'hidden' : 'visible',
          transition: collapsed[id] ? 'visibility 0s linear 220ms' : 'visibility 0s'
        }}
      >
        {children}
      </div>
    </div>
  );

  const renderChevron = (id) => (
    <i
      className='bx bx-chevron-down'
      style={{ fontSize: '1.3rem', color: 'var(--text-muted)', transform: collapsed[id] ? 'rotate(-90deg)' : 'none', transition: 'transform 200ms ease' }}
    ></i>
  );

  const renderStudentRow = (s) => (
    <div
      key={s.studentId}
      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 1rem', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}
    >
      <img
        src={avatarOf(s)}
        alt=""
        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = avatarFor(s.name); }}
        style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
      <div style={{ flex: 1, minWidth: '150px' }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.name}</div>
        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
          {s.email}{s.grade ? ` • ${s.grade}` : ''} • Joined {new Date(s.joinedAt).toLocaleDateString()}
        </div>
      </div>
      <div style={{ width: '160px' }}>
        <Dropdown
          ariaLabel={`Class period for ${s.name}`}
          value={periodName(s.periodId) ? s.periodId : ''}
          onChange={(v) => equipStore.setStudentPeriod(currentProgram.id, s.studentId, v || null)}
          style={{ fontSize: '0.82rem', padding: '0.4rem 0.65rem' }}
          options={[{ value: '', label: 'Unassigned' }, ...periods.map(p => ({ value: p.id, label: p.name }))]}
        />
      </div>
      <button
        type="button"
        className="btn btn-secondary btn-icon"
        onClick={() => handleRemoveStudent(s)}
        aria-label={`Remove ${s.name} from roster`}
        title="Remove from roster"
      >
        <i className='bx bx-trash'></i>
      </button>
    </div>
  );

  const renderTags = (proj) => {
    const tags = (proj.periodIds || []).map(periodName).filter(Boolean);
    if (!tags.length) return null;
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.4rem' }}>
        {tags.map(t => <span key={t} className="chip chip-tag">{t}</span>)}
      </div>
    );
  };

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
          data-tour="tab-tech"
          className={`tab-btn ${activeTab === 'tech' ? 'active' : ''}`}
          onClick={() => setActiveTab('tech')}
        >
          <i className='bx bx-microchip'></i>
          <span>Technology ({techList.length})</span>
        </button>

        <button
          data-tour="tab-projects"
          className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          <i className='bx bx-folder'></i>
          <span>Projects ({projectList.length})</span>
          {pendingCount > 0 && (
            <span className="status-badge badge-needs-repairs" style={{ fontSize: '0.7rem' }}>
              {pendingCount} Review
            </span>
          )}
        </button>

        <button
          data-tour="tab-roster"
          className={`tab-btn ${activeTab === 'roster' ? 'active' : ''}`}
          onClick={() => setActiveTab('roster')}
        >
          <i className='bx bx-group'></i>
          <span>Roster ({roster.length})</span>
        </button>

        <button
          data-tour="tab-settings"
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
          {/* Period filter */}
          {periods.length > 0 && (
            <div data-tour="period-filter" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '0.2rem' }}>Class period:</span>
              <button type="button" className={`chip ${projectPeriodFilter === 'all' ? 'active' : ''}`} onClick={() => setProjectPeriodFilter('all')}>All</button>
              {periods.map(per => (
                <button key={per.id} type="button" className={`chip ${projectPeriodFilter === per.id ? 'active' : ''}`} onClick={() => setProjectPeriodFilter(per.id)}>
                  {per.name}
                </button>
              ))}
              <button type="button" className={`chip ${projectPeriodFilter === 'untagged' ? 'active' : ''}`} onClick={() => setProjectPeriodFilter('untagged')}>Untagged</button>
            </div>
          )}

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
                      {renderTags(proj)}
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
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '0.5rem' }}>
                    {proj.description}
                  </p>
                  <div style={{ marginBottom: '0.6rem' }}>{renderTags(proj)}</div>
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

      {/* TAB 3: ROSTER (students grouped by class period) */}
      {activeTab === 'roster' && (
        <div>
          <div data-tour="roster-periods" className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.2rem' }}>Roster ({roster.length})</h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Students appear here when they join with your access code. Group them by class period. Only you can see this.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {sectionIds.length > 1 && (
                  <button type="button" className="btn btn-secondary" onClick={toggleAll}>
                    <i className={`bx ${allCollapsed ? 'bx-expand-vertical' : 'bx-collapse-vertical'}`}></i>
                    {allCollapsed ? 'Expand All' : 'Collapse All'}
                  </button>
                )}
                <button type="button" className="btn btn-primary" onClick={() => setPeriodModalOpen(true)}>
                  <i className='bx bx-plus'></i> Add Period
                </button>
              </div>
            </div>

            {periodError && (
              <div className="alert-box alert-danger" style={{ marginTop: '0.85rem', marginBottom: 0 }}>
                <i className='bx bx-error-circle'></i>
                <span>{periodError}</span>
              </div>
            )}
          </div>

          {roster.length === 0 && periods.length === 0 && (
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--bg-subtle)' }}>
              <i className='bx bx-group' style={{ fontSize: '1.6rem', color: 'var(--text-muted)' }}></i>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '0.3rem' }}>No students on your roster yet.</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Students join by signing up and entering your access code:{' '}
                <strong style={{ fontFamily: 'var(--font-mono)' }}>{currentProgram.code}</strong>
              </p>
            </div>
          )}

          {/* One collapsible section per class period */}
          {periods.map(per => {
            const members = studentsIn(per.id);
            return (
              <div key={per.id} className="card" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', padding: '0.4rem 0.6rem 0.4rem 0.4rem', background: 'var(--bg-subtle)', flexWrap: 'wrap' }}>
                  {editingPeriodId === per.id ? (
                    <form
                      onSubmit={(e) => { e.preventDefault(); handleSaveRename(per.id); }}
                      style={{ display: 'flex', gap: '0.4rem', flex: 1, minWidth: '200px', padding: '0.3rem 0 0.3rem 0.4rem' }}
                    >
                      <input
                        type="text"
                        className="form-input"
                        value={editingPeriodName}
                        onChange={(e) => setEditingPeriodName(e.target.value)}
                        maxLength={40}
                        autoFocus
                      />
                      <button type="submit" className="btn btn-primary btn-sm">Save</button>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setEditingPeriodId(null); setPeriodError(''); }}>Cancel</button>
                    </form>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => toggleCollapsed(per.id)}
                        aria-expanded={!collapsed[per.id]}
                        aria-label={`${collapsed[per.id] ? 'Expand' : 'Collapse'} ${per.name}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0, textAlign: 'left', padding: '0.4rem' }}
                      >
                        {renderChevron(per.id)}
                        <strong style={{ fontSize: '0.98rem' }}>{per.name}</strong>
                        <span className="status-badge badge-draft">{members.length} student{members.length === 1 ? '' : 's'}</span>
                      </button>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-icon"
                          style={{ width: 32, height: 32 }}
                          onClick={() => { setEditingPeriodId(per.id); setEditingPeriodName(per.name); setPeriodError(''); }}
                          aria-label={`Rename ${per.name}`}
                          title="Rename period"
                        >
                          <i className='bx bx-edit'></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-icon"
                          style={{ width: 32, height: 32 }}
                          onClick={() => handleDeletePeriod(per)}
                          aria-label={`Delete ${per.name}`}
                          title="Delete period"
                        >
                          <i className='bx bx-trash'></i>
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {renderCollapsible(per.id, members.length > 0 ? (
                  members.map(renderStudentRow)
                ) : (
                  <div style={{ padding: '0.9rem 1rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    No students in this period yet. Use the dropdown on a student to move them here.
                  </div>
                ))}
              </div>
            );
          })}

          {/* Students not in a period yet */}
          {unassignedStudents.length > 0 && (
            <div className="card" style={{ marginBottom: '1rem' }}>
              <div style={{ background: 'var(--bg-subtle)', padding: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => toggleCollapsed('unassigned')}
                  aria-expanded={!collapsed.unassigned}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', textAlign: 'left', padding: '0.4rem' }}
                >
                  {renderChevron('unassigned')}
                  <strong style={{ fontSize: '0.98rem' }}>{periods.length > 0 ? 'Unassigned' : 'All Students'}</strong>
                  <span className="status-badge badge-draft">{unassignedStudents.length} student{unassignedStudents.length === 1 ? '' : 's'}</span>
                </button>
              </div>
              {renderCollapsible('unassigned', (
                <>
                  {periods.length === 0 && (
                    <div style={{ padding: '0.7rem 1rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Add a class period above to start organizing your students.
                    </div>
                  )}
                  {unassignedStudents.map(renderStudentRow)}
                </>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SETTINGS */}
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

            <div data-tour="visibility-settings" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', marginTop: '0.5rem' }}>
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
        project={liveSelectedProject}
        isOpen={!!liveSelectedProject}
        onClose={() => setSelectedProject(null)}
        isFacilitator={true}
        onApprove={handleApproveProject}
        onReject={handleRejectProject}
        periods={periods}
        onSetPeriods={(projId, ids) => equipStore.setProjectPeriods(currentProgram.id, projId, ids)}
      />

      <AddPeriodModal
        isOpen={periodModalOpen}
        onClose={() => setPeriodModalOpen(false)}
        onAdd={handleAddPeriod}
      />

      <QrCodeModal
        program={currentProgram}
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />
    </div>
  );
}