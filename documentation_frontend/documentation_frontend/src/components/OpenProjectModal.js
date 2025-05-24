import React, { useEffect, useState } from 'react';
import { fetchProjects, fetchGammes } from '../services/projectService'; // Import des services nécessaires
import './OpenProjectModal.css';

const OpenProjectModal = ({ onClose, onOpen }) => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]); // Projets filtrés par gamme
  const [gammes, setGammes] = useState([]);
  const [selectedGamme, setSelectedGamme] = useState('Tous'); // Gamme sélectionnée
  const [error, setError] = useState(null);

  // Charger les gammes au montage
  useEffect(() => {
    const loadGammes = async () => {
      try {
        const data = await fetchGammes(); // Appel API pour récupérer les gammes
        setGammes([{ id: 'Tous', nom: 'Tous' }, ...data]); // Ajoute "Tous" au début
      } catch (err) {
        console.error('Erreur lors du chargement des gammes :', err);
        setError('Impossible de charger les gammes.');
      }
    };
    loadGammes();
  }, []);

  // Charger les projets au montage
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await fetchProjects(); // Appel API pour récupérer les projets
        setProjects(data);
        setFilteredProjects(data); // Par défaut, affiche tous les projets
      } catch (err) {
        console.error('Erreur lors du chargement des projets :', err);
        setError('Impossible de charger les projets.');
      }
    };
    loadProjects();
  }, []);

  // Filtrer les projets en fonction de la gamme sélectionnée
  useEffect(() => {
    if (selectedGamme === 'Tous') {
      setFilteredProjects(projects); // Affiche tous les projets
    } else {
      setFilteredProjects(
        projects.filter((project) => project.gamme?.id === parseInt(selectedGamme, 10)) // Filtre par gamme
      );
    }
  }, [selectedGamme, projects]);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Ouvrir un projet</h2>
        {error && <p className="error-message">{error}</p>}
        {!error && (
          <>
            {/* Menu déroulant pour sélectionner une gamme */}
            <label htmlFor="gamme-select">Filtrer par gamme :</label>
            <select
              id="gamme-select"
              value={selectedGamme}
              onChange={(e) => setSelectedGamme(e.target.value)} // Met à jour la gamme sélectionnée
            >
              {gammes.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nom}
                </option>
              ))}
            </select>

            {/* Liste des projets filtrés */}
            <ul className="project-list">
              {filteredProjects.map((project) => (
                <li
                  key={project.id}
                  className="project-item"
                  onClick={() => {
                    console.log(`Projet cliqué : ${project.nom}`); // Diagnostic: Enregistre le clic dans la console
                    onOpen(project);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {project.nom} ({project.gamme.nom})
                </li>
              ))}
            </ul>
          </>
        )}
        <div className="modal-buttons">
          <button onClick={onClose}>Annuler</button>
        </div>
      </div>
    </div>
  );
};

export default OpenProjectModal;
