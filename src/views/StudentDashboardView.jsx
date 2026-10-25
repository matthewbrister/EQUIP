import React, { useState } from 'react';
import { equipStore } from '../data/store';
import NewProjectModal from '../components/Modals/NewProjectModal';
import TechDetailModal from '../components/Modals/TechDetailModal';
import ProjectDetailModal from '../components/Modals/ProjectDetailModal';

export default function StudentDashboardView({ currentUser, setCurrentView }) {
  const [activeTab, setActiveTab] = useState('tech'); // 'tech' | 'my-projects' | 'all-projects'
  const [techSearch, setTechSearch] = useState('');
  const [techCategory, setTechCategory] = useState('all');
  
  // Modals state
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [selectedTech, setSelectedTech] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  const programs = equipStore.getPrograms();
  const studentProgram = programs.find(p => p.id === currentUser.programId);

  // If student hasn't entered code yet
  if (!studentProgram) {
    return (
      <div className="container" style={{ padding: '3.5rem 1.25rem', maxWidth: '540px', textAlign: 'center' }}>
        <div className="card" style={{ padding: '2.5rem 1.5rem' }}>
          <i className='bx bx-key' style={{ fontSize: '2.2rem', color: 'var(--color-primary)', marginBottom: '0.75rem', display: 'inline-block' }}></i>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Enter Program Access Code
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            Enter your facilitator's access code to view equipment operational statuses and upload projects.
          </p>
          <button className="btn btn-primary" onClick={() => setCurrentView('join')}>
            <i className='bx bx-key'></i>
            <span>Enter Access Code</span>
          </button>
        </div>
      </div>
    );
  }

  // Filter tech
  const techList = studentProgram.technologies || [];
  const filteredTech = techList.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(techSearch.toLowerCase()) || 
                          (t.assetNumber && t.assetNumber.toLowerCase().includes(techSearch.toLowerCase())) ||
                          t.category.toLowerCase().includes(techSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (techCategory === 'all') return true;
    if (techCategory === 'sensitive') return t.hasSensitiveData;
    return t.category === techCategory;
  });

  // Projects
  const allProjects = studentProgram.projects || [];
  const myProjects = allProjects.filter(p => 
    p.submittedBy === currentUser.name || 
    (p.teamMembers && p.teamMembers.some(m => m.name.toLowerCase() === currentUser.name.toLowerCase()))
  );
  const approvedPeerProjects = allProjects.filter(p => p.status === 'approved');

  const handleAddProject = (projectData) => {
    equipStore.addProject(studentProgram.id, projectData, currentUser);
    setActiveTab('my-projects');
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      {/* Program Header */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
              <span className="brand-tag-east">STUDENT WORKSPACE</span>
              <span className="status-badge badge-working">Enrolled</span>
            </div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{studentProgram.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
              <span><i className='bx bx-map-pin'></i> Room {studentProgram.campusRoomNumber}</span>
              <span><i className='bx bx-user'></i> Facilitator: {studentProgram.facilitator.name}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary btn-sm" onClick={() => setIsNewProjectOpen(true)}>
              <i className='bx bx-plus'></i>
              <span>Upload Project Draft</span>
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setCurrentView('join')}>
              Change Lab
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
          className={`tab-btn ${activeTab === 'my-projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-projects')}
        >
          <i className='bx bx-folder'></i>
          <span>My Projects ({myProjects.length})</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'all-projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('all-projects')}
        >
          <i className='bx bx-grid-alt'></i>
          <span>Peer Showcase ({approvedPeerProjects.length})</span>
        </button>
      </div>

      {/* TAB 1: BROWSE TECHNOLOGIES */}
      {activeTab === 'tech' && (
        <div>
          {/* Sensitive Data Notice */}
          <div className="alert-box alert-warning">
            <i className='bx bx-shield-quarter' style={{ fontSize: '1.2rem' }}></i>
            <div style={{ fontSize: '0.82rem' }}>
              <strong>Protected Project Data:</strong> Notice tags mark equipment with active project files. Do not format, reimage, or alter those directories.
            </div>
          </div>

          {/* Search & Filters */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search equipment by name or asset #..."
              value={techSearch}
              onChange={(e) => setTechSearch(e.target.value)}
              style={{ maxWidth: '320px' }}
            />

            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button 
                className={`btn btn-sm ${techCategory === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setTechCategory('all')}
              >
                All Tech
              </button>
              <button 
                className={`btn btn-sm ${techCategory === 'sensitive' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setTechCategory('sensitive')}
              >
                Sensitive Only
              </button>
            </div>
          </div>

          <div className="grid-3">
            {filteredTech.map(tech => (
              <div 
                key={tech.id} 
                className="card"
                style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                onClick={() => setSelectedTech(tech)}
              >
                <div style={{ height: '140px', position: 'relative', background: '#0f172a' }}>
                  <img src={tech.photo} alt={tech.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                        Protected project files present
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

                    {tech.hasSensitiveData && tech.dataLocation && (
                      <div style={{ background: 'var(--bg-subtle)', padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--color-warning)', marginBottom: '0.4rem', fontFamily: 'var(--font-mono)' }}>
                        Path: {tech.dataLocation}
                      </div>
                    )}

                    {tech.note && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {tech.note}
                      </p>
                    )}
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem', marginTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>{tech.manualUrl ? 'Digital Manual Available' : 'Ask Facilitator'}</span>
                    <span>View details</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MY PROJECTS & DRAFTS */}
      {activeTab === 'my-projects' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>My Projects</h2>
            <button className="btn btn-primary btn-sm" onClick={() => setIsNewProjectOpen(true)}>
              <i className='bx bx-plus'></i>
              <span>Upload Project Draft</span>
            </button>
          </div>

          {myProjects.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {myProjects.map(proj => (
                <div 
                  key={proj.id} 
                  className="card"
                  style={{ padding: '1.25rem', cursor: 'pointer' }}
                  onClick={() => setSelectedProject(proj)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                        {proj.status === 'approved' ? (
                          <span className="status-badge badge-approved">Approved</span>
                        ) : proj.status === 'needs-revisions' ? (
                          <span className="status-badge badge-needs-repairs">Revisions Requested</span>
                        ) : (
                          <span className="status-badge badge-draft">Draft (Pending Review)</span>
                        )}
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{proj.category}</span>
                      </div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{proj.name}</h3>
                    </div>

                    <button className="btn btn-secondary btn-sm">
                      Inspect
                    </button>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    {proj.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                    <span>{proj.teamMembers?.length || 1} Team Members</span>
                    <span>{proj.communicationLogs?.length || 0} Partner Logs</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <i className='bx bx-folder' style={{ fontSize: '2rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'inline-block' }}></i>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>No projects submitted yet</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Upload your project proposal, team members, and communication logs for facilitator review.
              </p>
              <button className="btn btn-primary btn-sm" onClick={() => setIsNewProjectOpen(true)}>
                <i className='bx bx-plus'></i> Upload Draft
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PEER PROJECTS */}
      {activeTab === 'all-projects' && (
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>
            Approved Peer Projects
          </h2>

          <div className="grid-2">
            {approvedPeerProjects.map(proj => (
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
                  <span>{proj.communicationLogs?.length || 0} Partner Logs</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        onAdd={handleAddProject}
        studentUser={currentUser}
      />

      <TechDetailModal
        tech={selectedTech}
        isOpen={!!selectedTech}
        onClose={() => setSelectedTech(null)}
        isFacilitator={false}
      />

      <ProjectDetailModal
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        isFacilitator={false}
      />
    </div>
  );
}
