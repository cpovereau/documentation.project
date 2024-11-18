import React, { useState } from 'react';
import { FaPlus, FaFolderOpen, FaTrash } from 'react-icons/fa';
import CreateProjectModal from './CreateProjectModal';
import { notify } from '../utils/notifications';
import { toast } from 'react-toastify';
import { createProject } from '../services/projectService';
import './ProjectContainer.css';

console.log('Toast Positions:', toast.POSITION);

const ProjectContainer = () => {
  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projects, setProjects] = useState([]); // Liste des projets

  const openCreateModal = () => setShowCreateModal(true);
  const closeCreateModal = () => setShowCreateModal(false);
  
  // Fonction pour créer un projet en utilisant le service
  const handleCreateProject = async (projectData) => {
    try {
      console.log('Tentative d\'enregistrement du projet :', projectData);
      const response = await createProject(projectData); // Utilisation de createProject
      console.log('Projet créé avec succès :', response);
      notify("Projet créé avec succès !", "success");
      setProjects((prevProjects) => [...prevProjects, response]); // Ajout du nouveau projet
      setIsProjectOpen(true); // Simule l'ouverture d'un projet
      closeCreateModal();
    } catch (error) {
      console.error('Erreur lors de la création du projet :', error);
      notify("Erreur lors de la création du projet", "error");
    }
  };

  return (
    <div className="project-container">
      <div className="toolbar">
        <button onClick={openCreateModal} title="Créer un projet">
          <FaPlus />
        </button>
        <button onClick={() => console.log('Ouvrir un projet existant')} title="Ouvrir un projet">
          <FaFolderOpen />
        </button>
        <button
          onClick={() => console.log('Supprimer le projet actif')}
          title="Supprimer le projet"
          disabled={!isProjectOpen}
        >
          <FaTrash />
        </button>
      </div>
      <div className="content">
        {projects.length > 0 ? (
          <ul>
            {projects.map((project) => (
              <li key={project.id}>{project.nom}</li>
            ))}
          </ul>
        ) : (
          <p>Pas de projets disponibles.</p>
        )}
      </div>
      {showCreateModal && (
        <CreateProjectModal 
          onClose={closeCreateModal} 
          onCreate={handleCreateProject} 
        />
      )}
    </div>
  );
};

export default ProjectContainer;
