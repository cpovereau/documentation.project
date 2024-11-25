// frontend/src/components/ProjetList.js
import React from 'react';
import './ProjectList.css';

const ProjetList = ({ projects, onSelectProject, activeProject }) => {
  return (
    <div className="project-list">
      {projects.map((project) => (
        <div 
          key={project.id}
          className={`project-item ${activeProject?.id === project.id ? 'active' : ''}`} 
          onClick={() => onSelectProject(project)}
        >
          {project.nom} <span className="project-gamme">({project.gamme})</span>
        </div>
      ))}
    </div>
  );
};

export default ProjetList;
