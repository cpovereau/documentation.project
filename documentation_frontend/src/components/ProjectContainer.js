import React, { useState, useEffect } from 'react';
import { FaPlus, FaFolderOpen, FaTrash } from 'react-icons/fa';
import CreateProjectModal from './CreateProjectModal';
import { notify } from '../utils/notifications';
import { toast } from 'react-toastify';
import { createProject } from '../services/projectService';
import { fetchGammes } from '../services/projectService';
import { fetchProjects } from '../services/projectService';
import OpenProjectModal from './OpenProjectModal';
import ProjetList from './ProjetList'; 
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
      console.log('Projets chargés :', projects); // Log des projets
      const enrichedProjects = projects.map((project) => {
        const gammeId = project.gamme?.id; // Vérifie que gamme existe avant d'accéder à id
        const gamme = gammes.find((g) => g.id === gammeId); // Cherche la gamme correspondante
        console.log(`Projet : ${project.nom}, Gamme associée :`, gamme); // Log de la correspondance
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

  useEffect(() => {
    if (gammes.length > 0) {
      fetchProjectsWithGammeNames(); // Charge les projets une fois les gammes récupérées
    }
  }, [gammes]); // Recharge les projets lorsque les gammes sont disponibles

  // Fonction pour créer un projet en utilisant le service
  const handleCreateProject = async (projectData) => {
    try {
      console.log('Tentative d\'enregistrement du projet :', projectData);

      // Appel au service pour créer le projet
      const response = await createProject(projectData);
      console.log('Projet créé avec succès :', response);

      // Associe le nom de la gamme au nouveau projet
      const gamme = gammes.find((g) => g.id === parseInt(response.gamme, 10));
      const projectWithGammeName = {
        ...response,
        gammeNom: gamme ? gamme.nom : 'Gamme inconnue',
      };

      // Mise à jour explicite de la liste des projets
      setProjects((projects) => projects.concat(projectWithGammeName));
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
    setActiveProject(project); // Définit le projet comme actif
    setShowOpenModal(false); // Ferme la modale
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
