import React, { useEffect, useState } from 'react';
import './OpenProjectModal.css';

const OpenProjectModal = ({ onClose, onOpen }) => {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await fetchProjects(); // Appel de l'API pour récupérer les projets
        setProjects(data);
      } catch (err) {
        console.error('Erreur lors du chargement des projets :', err);
        setError('Impossible de charger les projets.');
      }
    };
    loadProjects();
  }, []);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Ouvrir un projet</h2>
        {error && <p className="error-message">{error}</p>}
        {!error && (
          <ul className="project-list">
            {projects.map((project) => (
              <li
                key={project.id}
                className="project-item"
                onClick={() => onOpen(project)} // Ouvre le projet sélectionné
              >
                {project.nom} ({project.gamme})
              </li>
            ))}
          </ul>
        )}
        <div className="modal-buttons">
          <button onClick={onClose}>Annuler</button>
        </div>
      </div>
    </div>
  );
};

export default OpenProjectModal;
