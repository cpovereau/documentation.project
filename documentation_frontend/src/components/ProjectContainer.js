import React, { useState, useEffect } from 'react';
import { FaPlus, FaFolderOpen, FaTrash, FaSync } from 'react-icons/fa';
import CreateProjectModal from './CreateProjectModal';
import DeleteProjectModal from './DeleteProjectModal';
import OpenProjectModal from './OpenProjectModal';
import ProjetList from './ProjetList';
import { notify } from '../utils/notifications';
import { createProject, fetchGammes, fetchProjectById, fetchProjects, deleteProject } from '../services/projectService';
import './ProjectContainer.css';

const ProjectContainer = ({ activeProject, setActiveProject, setMaps }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [gammes, setGammes] = useState([]);
  const [projects, setProjects] = useState([]);

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

  // Charger tous les projets existants
  const handleLoadProjects = async () => {
    try {
      const projectsData = await fetchProjects();
      setProjects(projectsData);
      notify("Projets chargés avec succès !", "success");
    } catch (error) {
      console.error('Erreur lors du chargement des projets :', error);
      notify("Erreur lors du chargement des projets", "error");
    }
  };

  // Sélectionner un projet et charger ses détails
  const handleSelectProject = async (project) => {
    try {
      console.log(`Projet sélectionné dans OpenProjectModal : ${project.nom}`);
  
      // Récupérer les détails complets du projet
      const fullProject = await fetchProjectById(project.id);
  
      // Enrichir le projet avec le nom de la gamme
      const gammeId = fullProject?.gamme?.id;
      const gamme = gammes.find((g) => g.id === gammeId);
  
      const enrichedProject = {
        ...fullProject,
        gammeNom: gamme ? gamme.nom : 'Gamme inconnue',
      };
  
      // Mettre à jour le projet actif
      setActiveProject(enrichedProject);
  
      // Ajouter le projet à la liste des projets s'il n'existe pas encore
      setProjects((prevProjects) => {
        const exists = prevProjects.some((proj) => proj.id === enrichedProject.id);
        return exists ? prevProjects : [...prevProjects, enrichedProject];
      });
  
      // Mettre à jour les maps associées
      setMaps(fullProject.maps || []);
  
      console.log("Projet actif après sélection :", enrichedProject);
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du projet :', error);
      notify("Erreur lors de l'ouverture du projet", "error");
    }
  };
  

  // Créer un nouveau projet
  const handleCreateProject = async (projectData) => {
    try {
      const newProjectWrapper = await createProject(projectData);
      const newProject = newProjectWrapper.projet;

      setProjects((prevProjects) => [...prevProjects, newProject]);
      setActiveProject(newProject); // Mettre à jour le projet actif
      setMaps(newProjectWrapper.maps || []); // Mettre à jour les maps associées

      setShowCreateModal(false);
      notify("Projet créé avec succès !", "success");
    } catch (error) {
      console.error('Erreur lors de la création du projet :', error);
      notify("Erreur lors de la création du projet", "error");
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
          onClick={() => setShowDeleteModal(true)}
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

      {showCreateModal && (
        <CreateProjectModal 
          onClose={() => setShowCreateModal(false)} 
          onCreate={handleCreateProject} 
        />
      )}
      {showOpenModal && (
        <OpenProjectModal
          onClose={() => setShowOpenModal(false)}
          onOpen={handleSelectProject} // Passe handleSelectProject comme callback
        />
      )}
      {showDeleteModal && (
        <DeleteProjectModal 
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {
            if (activeProject) {
              deleteProject(activeProject.id);
              setActiveProject(null);
              setMaps([]);
              setShowDeleteModal(false);
            }
          }}
        />
      )}
    </div>
  );
};

export default ProjectContainer;
