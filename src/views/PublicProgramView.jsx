import React, { useState } from 'react';
import { equipStore } from '../data/store';
import Dropdown from '../components/Dropdown';
import TechDetailModal from '../components/Modals/TechDetailModal';
import ProjectDetailModal from '../components/Modals/ProjectDetailModal';

export default function PublicProgramView({ setCurrentView }) {
  const programs = equipStore.getPrograms().filter(p => p.status === 'approved');
  const [selectedProgramId, setSelectedProgramId] = useState(programs[0]?.id || '');
  const [selectedTech, setSelectedTech] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const activeProgram = programs.find(p => p.id === selectedProgramId) || programs[0];

  if (!activeProgram) {
    return (
      <div className="container" style={{ padding: '3.5rem 1.25rem', textAlign: 'center' }}>
        <h2>No approved programs currently listed.</h2>
      </div>
    );
  }

  const handleCopyShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Technology and projects stay private unless the facilitator opted in
  const showTech = activeProgram.showTechnologyPublicly === true;
  const showProjects = activeProgram.showProjectsPublicly === true;

  const techList = activeProgram.technologies || [];
  const approvedProjects = (activeProgram.projects || []).filter(p => p.status === 'approved');

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      {/* Program Selector Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Select Lab:
          </span>
          <Dropdown
            value={activeProgram.id}
            onChange={setSelectedProgramId}
            style={{ fontWeight: 600, fontSize: '0.85rem', width: 'auto', minWidth: '200px', padding: '0.4rem 0.65rem' }}
            options={programs.map(p => ({ value: p.id, label: p.name }))}
          />
        </div>

        <button className="btn btn-secondary btn-sm" onClick={handleCopyShare}>
          <i className={`bx ${linkCopied ? 'bx-check' : 'bx-share-alt'}`}></i>
          <span>{linkCopied ? 'Copied' : 'Share'}</span>
        </button>
      </div>

      {/* Program Profile Card */}
      <div data-tour="public-profile" className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="brand-tag-east" style={{ marginBottom: '0.35rem', display: 'inline-block' }}>
              PUBLIC DIRECTORY
            </span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{activeProgram.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
              <span><i className='bx bx-map-pin'></i> {activeProgram.campusRoomNumber} • {activeProgram.location}</span>
              <span><i className='bx bx-user'></i> {activeProgram.facilitator.name}</span>
              <span><i className='bx bx-envelope'></i> {activeProgram.facilitator.email}</span>
            </div>
            {activeProgram.description && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.75rem', lineHeight: 1.5 }}>
                {activeProgram.description}
              </p>
            )}
          </div>

          <button className="btn btn-primary btn-sm" onClick={() => setCurrentView('join')}>
            <i className='bx bx-key'></i> Enter Access Code
          </button>
        </div>
      </div>

      {!showTech && !showProjects && (
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--bg-subtle)' }}>
          <i className='bx bx-lock-alt' style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}></i>
          <div style={{ fontWeight: 600, fontSize: '0.92rem', marginTop: '0.35rem' }}>
            This program keeps its inventory and student projects private.
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Students can enter their facilitator's access code to view them.
          </p>
        </div>
      )}

      {/* Projects Showcase */}
      {showProjects && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>
            Approved Community Projects ({approvedProjects.length})
          </h2>

          {approvedProjects.length > 0 ? (
            <div className="grid-2">
              {approvedProjects.map(proj => (
                <div
                  key={proj.id}
                  className="card"
                  style={{ padding: '1.25rem', cursor: 'pointer' }}
                  onClick={() => setSelectedProject(proj)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{proj.name}</h3>
                    <span className="status-badge badge-approved">Verified</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    {proj.category}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                    {proj.description}
                  </p>
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <span>Team Lead: <strong>{proj.submittedBy}</strong></span>
                    <span>View Details & Logs</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No approved projects published yet.</p>
          )}
        </div>

      )}

      {/* Lab Hardware Overview */}
      {showTech && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>
            Lab Technology Inventory ({techList.length})
          </h2>

          <div className="grid-3">
            {techList.map(tech => (
              <div
                key={tech.id}
                className="card"
                style={{ padding: '1rem', cursor: 'pointer' }}
                onClick={() => setSelectedTech(tech)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {tech.assetNumber}
                  </span>
                  {tech.status === 'working' ? (
                    <span className="status-badge badge-working">Ready</span>
                  ) : (
                    <span className="status-badge badge-needs-repairs">Maintenance</span>
                  )}
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{tech.name}</h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {tech.category}
                </div>
              </div>
            ))}
          </div>
        </div>

      )}

      {/* Modals */}
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