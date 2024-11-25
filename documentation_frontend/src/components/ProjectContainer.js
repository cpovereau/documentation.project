import React, { useState, useEffect } from 'react';
import { FaPlus, FaFolderOpen, FaTrash } from 'react-icons/fa';
import CreateProjectModal from './CreateProjectModal';
import { notify } from '../utils/notifications';
import { toast } from 'react-toastify';
import { createProject } from '../services/projectService';
import { fetchProjects } from '../services/projectService';
import OpenProjectModal from './OpenProjectModal';
import ProjetList from './ProjetList'; 
import './ProjectContainer.css';

const ProjectContainer = () => {
  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);

  const openCreateModal = () => setShowCreateModal(true);
  const closeCreateModal = () => setShowCreateModal(false);
  
  // Fonction pour créer un projet en utilisant le service
  const handleCreateProject = async (projectData) => {
    try {
      console.log('Tentative d\'enregistrement du projet :', projectData);

      // Appel au service pour créer le projet
      const response = await createProject(projectData);
      console.log('Projet créé avec succès :', response);

      // Mise à jour explicite de la liste des projets
      setProjects((projects) => projects.concat(response));
      console.log('Projets mis à jour :', projects);

      // Notification de succès
      console.log("Appel à notify avec message : Projet créé avec succès !");
      notify("Projet créé avec succès !", "success");

      // Ferme la fenêtre modale
      closeCreateModal();
    } catch (error) {
      console.error('Erreur lors de la création du projet :', error);

      // Notification d'erreur
      console.log("Appel à notify avec message : Erreur lors de la création du projet");
      notify("Erreur lors de la création du projet", "error");
    }
  };

  // Fonction pour ouvrir un projet
  const handleOpenProject = (project) => {
      console.log('Projet ouvert :', project);
      setActiveProject(project); // Définit le projet comme actif
      setShowOpenModal(false); // Ferme la modale
  };

  // Fonction pour récupérer les projets existants
  const fetchProjects = async () => {
    const response = await fetch('/api/projets'); // Remplacez par votre API réelle
    const data = await response.json();
    return data;
  };
  

  // Fonction pour sélectionner un projet
  const handleSelectProject = (project) => {
    console.log('Projet sélectionné :', project);
    setActiveProject(project);
  };

  return (
    <div className="project-container">
      <div className="toolbar">
        <button onClick={openCreateModal} title="Créer un projet">
          <FaPlus />
        </button>
        <button onClick={() => setShowOpenModal(true)} title="Ouvrir un projet">
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
        <ProjetList 
          projects={projects} 
          onSelectProject={handleSelectProject} 
          activeProject={activeProject} 
        />
        {projects.length === 0 && <p>Pas de projets disponibles.</p>}
      </div>
      {showCreateModal && (
        <CreateProjectModal 
          onClose={closeCreateModal} 
          onCreate={handleCreateProject} 
        />
      )}
      {showOpenModal && (
        <OpenProjectModal
          onClose={() => setShowOpenModal(false)}
          onOpen={handleOpenProject}
          fetchProjects={fetchProjects}
        />
      )}
    </div>
  );
};

export default ProjectContainer;
