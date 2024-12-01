import React, { useState, useEffect } from 'react';
import { FaPlus, FaFolderOpen, FaTrash } from 'react-icons/fa';
import CreateProjectModal from './CreateProjectModal';
import { notify } from '../utils/notifications';
import { createProject } from '../services/projectService';
// import { toast } from 'react-toastify';
// import { createProject } from '../services/projectService';
import { fetchGammes } from '../services/projectService';
import { fetchProjectById } from '../services/projectService';
import { fetchProjects } from '../services/projectService';
import OpenProjectModal from './OpenProjectModal';
import ProjetList from './ProjetList'; 
import { deleteProject } from '../services/projectService';
import './ProjectContainer.css';

const ProjectContainer = () => {
  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [gammes, setGammes] = useState([]); // Nouveau : état pour les gammes
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);

  const openCreateModal = () => setShowCreateModal(true);
  const closeCreateModal = () => setShowCreateModal(false);

  // Fonction pour récupérer les gammes
  const loadGammes = async () => {
    try {
      const data = await fetchGammes(); // Appel de la fonction de service
      console.log('Gammes chargées :', data); // Log des gammes
      setGammes(data); // Stocke les gammes dans l'état
    } catch (error) {
      console.error('Erreur lors du chargement des gammes :', error);
      notify('Impossible de charger les gammes', 'error');
    }
  };

  // Fonction pour récupérer les projets et enrichir avec les noms des gammes
  const fetchProjectsWithGammeNames = async () => {
    try {
      const projects = await fetchProjects(); // Récupération des projets existants
      const enrichedProjects = projects.map((project) => {
        const gammeId = project.gamme?.id; // Vérifie que gamme existe avant d'accéder à id
        const gamme = gammes.find((g) => g.id === gammeId); // Cherche la gamme correspondante
        return {
          ...project,
          gammeNom: gamme ? gamme.nom : 'Gamme inconnue', // Ajoute le nom de la gamme
        };
      });
      setProjects(enrichedProjects); // Met à jour la liste des projets
    } catch (error) {
      console.error('Erreur lors de la récupération des projets :', error);
      notify('Impossible de charger les projets', 'error');
    }
  };

  useEffect(() => {
    loadGammes(); // Charge les gammes au montage
  }, []);

  // Fonction pour créer un projet en utilisant le service
  const handleCreateProject = async (projectData) => {
    try {
      console.log('Tentative de création du projet :', projectData);
  
      // Appel au service pour créer le projet
      const createdProject = await createProject(projectData);
      console.log('Projet créé avec succès, Données du projet créé :', createdProject);
  
      // Récupérer l'ID correct depuis la structure de la réponse
      const projectId = createdProject.projet?.id; // Accès à l'ID via createdProject.projet.id
      if (!projectId) {
        console.error('Erreur : l\'ID du projet est indéfini.');
        return;
      }
  
      // Récupérer le projet complet avec toutes ses relations (y compris la gamme)
      const enrichedProject = await fetchProjectById(projectId);
      console.log('Projet enrichi récupéré :', enrichedProject);
  
      // Mise à jour explicite de la liste des projets avec le projet enrichi
      setProjects((projects) => [...projects, enrichedProject]);
      console.log('Projets mis à jour :', projects);
  
      // Notification de succès
      notify("Projet créé avec succès !", "success");
  
      // Ferme la fenêtre modale
      closeCreateModal();
    } catch (error) {
      console.error('Erreur lors de la création du projet :', error);
  
      // Notification d'erreur
      notify("Erreur lors de la création du projet", "error");
    }
  };
  
  // Fonction pour ouvrir un projet
  const handleOpenProject = (project) => {
    console.log('Projet ouvert :', project);
      // Ajoute le projet si il n'est pas présent dans la liste
  setProjects((prevProjects) => {
    if (!prevProjects.some((p) => p.id === project.id)) {
      return [
        ...prevProjects,
        {
          ...project,
          gammeNom: project.gamme?.nom || 'Gamme inconnue', // Ajoute le nom de la gamme
        },
      ];
    }
    return prevProjects;
  });

  // Définit le projet comme actif
  setActiveProject({
    ...project,
    gammeNom: project.gamme?.nom || 'Gamme inconnue', // Ajoute également gammeNom pour activeProject
  });

  // Ferme la fenêtre modale
  setShowOpenModal(false);
  };

  // Fonction pour mettre à jour la liste des projets
  const addProjectToList = (project) => {
    // Évite d'ajouter plusieurs fois le même projet
    if (!projects.some((p) => p.id === project.id)) {
      setProjects((prevProjects) => [...prevProjects, project]);
    }
  };

  // Fonction pour sélectionner un projet
  const handleSelectProject = (project) => {
    console.log('Projet sélectionné :', project);
    setActiveProject(project);
  };

  // Fonction pour supprimer un projet
  const handleDeleteProject = async (projectId) => {
  try {
    // Appel au service pour supprimer le projet
    await deleteProject(projectId);
    console.log(`Projet ${projectId} supprimé.`);

    // Mise à jour de la liste des projets
    setProjects((prevProjects) => prevProjects.filter((p) => p.id !== projectId));

    // Si le projet actif est supprimé, le désactiver
    if (activeProject?.id === projectId) {
      setActiveProject(null);
    }

    notify('Projet supprimé avec succès !', 'success');
  } catch (error) {
    console.error('Erreur lors de la suppression du projet :', error);
    notify('Erreur lors de la suppression du projet.', 'error');
  }
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
          onClick={() => handleDeleteProject(activeProject?.id)}
          title="Supprimer le projet"
          disabled={!activeProject}
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
