import React, { useState, useEffect } from 'react';
import { FaPlus, FaFolderOpen, FaTrash, FaSync } from 'react-icons/fa';
import CreateProjectModal from './CreateProjectModal';
import DeleteProjectModal from './DeleteProjectModal';
import { notify } from '../utils/notifications';
import { createProject, fetchGammes, fetchProjectById, fetchProjects, deleteProject } from '../services/projectService';
import OpenProjectModal from './OpenProjectModal';
import ProjetList from './ProjetList'; 
import MapsContainer from './MapsContainer';
import './ProjectContainer.css';

const ProjectContainer = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [gammes, setGammes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);

  // Charger les gammes disponibles au montage du composant
  useEffect(() => {
    const loadGammes = async () => {
      try {
        const gammesData = await fetchGammes();
        setGammes(gammesData);
      } catch (error) {
        console.error('Erreur lors du chargement des gammes :', error);
        notify('Impossible de charger les gammes', 'error');
      }
    };
    loadGammes();
  }, []);

  // Fonction pour charger tous les projets et les enrichir avec les noms des gammes
  const handleLoadProjects = async () => {
    try {
      const projectsData = await fetchProjects(); // Récupère les projets existants

      // Ajuster les projets pour correspondre à la nouvelle structure encapsulée
      const enrichedProjects = projectsData.map((projectWrapper) => {
        const project = projectWrapper.projet;
        const gammeId = project?.gamme?.id;
        const gamme = gammes.find((g) => g.id === gammeId);

        return {
          ...project,
          gammeNom: gamme ? gamme.nom : 'Gamme inconnue',
        };
      });

      setProjects(enrichedProjects); // Met à jour la liste des projets enrichis
      notify("Projets chargés avec succès !", "success");
    } catch (error) {
      console.error('Erreur lors du chargement des projets :', error);
      notify("Erreur lors du chargement des projets", "error");
    }
  };

  // Fonction pour créer un projet
  const handleCreateProject = async (projectData) => {
    try {
      const newProjectWrapper = await createProject(projectData);
      const newProject = newProjectWrapper.projet;

      // Enrichir le nouveau projet avec le nom de la gamme
      const gammeId = newProject?.gamme?.id;
      const gamme = gammes.find((g) => g.id === gammeId);

      const enrichedProject = {
        ...newProject,
        gammeNom: gamme ? gamme.nom : 'Gamme inconnue',
      };

      notify("Projet créé avec succès !", "success");

      // Ajouter le nouveau projet à la liste des projets
      setProjects((prevProjects) => [...prevProjects, enrichedProject]);
      setActiveProject(enrichedProject); // Définir le projet créé comme actif
      setShowCreateModal(false);
    } catch (error) {
      console.error('Erreur lors de la création du projet :', error);
      notify("Erreur lors de la création du projet", "error");
    }
  };

  // Fonction pour supprimer un projet avec confirmation
  const handleDeleteProject = async () => {
    if (!activeProject) return;

    try {
      await deleteProject(activeProject.id);
      notify("Projet supprimé avec succès !", "success");
      setProjects((prevProjects) => prevProjects.filter((proj) => proj.id !== activeProject.id));
      setActiveProject(null);
      setShowDeleteModal(false); // Fermer la modale de suppression après la suppression
    } catch (error) {
      console.error('Erreur lors de la suppression du projet :', error);
      notify("Erreur lors de la suppression du projet", "error");
    }
  };

  // Fonction pour ouvrir le modal de suppression
  const handleDeleteRequest = () => {
    setShowDeleteModal(true);
  };

  // Fonction pour sélectionner un projet et charger ses détails via fetchProjectById
  const handleSelectProject = async (project) => {
    try {
      console.log("Projet sélectionné dans handleSelectProject : ${project.nom}");
      const fullProject = await fetchProjectById(project.id);

      // Enrichir le projet avec le nom de la gamme
      const gammeId = fullProject?.gamme?.id;
      const gamme = gammes.find((g) => g.id === gammeId);

      const enrichedProject = {
        ...fullProject,
        gammeNom: gamme ? gamme.nom : 'Gamme inconnue',
      };

      // Vérifier si le projet est déjà dans la liste
      const existingProject = projects.find((proj) => proj.id === enrichedProject.id);

      if (!existingProject) {
        // Ajouter le projet s'il n'existe pas déjà dans la liste
        setProjects((prevProjects) => [...prevProjects, enrichedProject]);
      }

      // Définir le projet comme actif
      setActiveProject(enrichedProject);
      console.log("Projet actif après sélection :", enrichedProject); // Diagnostic
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du projet :', error);
      notify("Erreur lors de l'ouverture du projet", "error");
    }
  };

  return (
    <div className="project-container">
      <div className="toolbar">
        <button onClick={() => setShowCreateModal(true)} title="Créer un projet">
          <FaPlus />
        </button>
        <button onClick={handleLoadProjects} title="Charger les projets">
          <FaSync />
        </button>
        <button onClick={() => setShowOpenModal(true)} title="Ouvrir un projet">
          <FaFolderOpen />
        </button>
        <button
          onClick={handleDeleteRequest}
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
        {projects.length === 0 && <p>Pas de projets disponibles. Cliquez sur "Charger les projets" pour commencer.</p>}
      </div>
      {activeProject && (
        <MapsContainer
          isProjectLoaded={!!activeProject}
          currentProject={activeProject}
          setTreeData={(data) => setActiveProject((prev) => ({ ...prev, maps: data }))}
        />
      )}
      {showCreateModal && (
        <CreateProjectModal 
          onClose={() => setShowCreateModal(false)} 
          onCreate={handleCreateProject} 
        />
      )}
      {showOpenModal && (
        <OpenProjectModal
          onClose={() => setShowOpenModal(false)}
          onOpen={handleSelectProject} 
        />
      )}
      {showDeleteModal && (
        <DeleteProjectModal 
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteProject}
        />
      )}
    </div>
  );
};

export default ProjectContainer;