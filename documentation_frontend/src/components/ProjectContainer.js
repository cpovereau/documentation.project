// src/components/ProjectContainer.js
import React, { useState } from 'react';
import { FaPlus, FaFolderOpen, FaTrash } from 'react-icons/fa';
import './ProjectContainer.css';

const ProjectContainer = () => {
  const [isProjectOpen, setIsProjectOpen] = useState(false);

  const handleCreateProject = () => {
    console.log("Créer un nouveau projet");
  };

  const handleOpenProject = () => {
    console.log("Ouvrir un projet existant");
    setIsProjectOpen(true);
  };

  const handleDeleteProject = () => {
    if (isProjectOpen) {
      console.log("Supprimer le projet actif");
      setIsProjectOpen(false);
    }
  };

  return (
    <div className="project-container">
      <div className="toolbar">
        <button onClick={handleCreateProject} title="Créer un projet">
          <FaPlus />
        </button>
        <button onClick={handleOpenProject} title="Ouvrir un projet">
          <FaFolderOpen />
        </button>
        <button 
          onClick={handleDeleteProject} 
          title="Supprimer le projet"
          disabled={!isProjectOpen}
        >
          <FaTrash />
        </button>
      </div>
      <div className="content">
        <p>Placeholder pour le contenu du projet</p>
      </div>
    </div>
  );
};

export default ProjectContainer;
