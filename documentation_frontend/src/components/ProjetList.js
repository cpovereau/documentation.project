// frontend/src/components/ProjetList.js
import React from 'react';
import './ProjectList.css';

const ProjetList = ({ projects, onSelectProject }) => {
   return (
    <div className="project-list">
      {projects.map((project) => (
        <div 
          key={project.id}
          className="project-item"
          onClick={() => onSelectProject(project)}
        >
          {project.nom}
        </div>
      ))}
    </div>
  );
};

export default ProjetList;
