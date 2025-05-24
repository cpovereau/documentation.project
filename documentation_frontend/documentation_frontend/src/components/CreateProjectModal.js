// src/components/CreateProjectModal.js
import React, { useState, useEffect } from 'react';
import { fetchGammes } from '../services/projectService';
import './CreateProjectModal.css';

const CreateProjectModal = ({ onClose, onCreate }) => {
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [gamme, setGamme] = useState('Hébergement');
  const [gammes, setGammes] = useState([]);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Empêcher double soumission

  useEffect(() => {
    const loadGammes = async () => {
      try {
        const data = await fetchGammes();
        console.log('Gammes chargées :', data);
        setGammes(data);
        setGamme(data[0]?.id || '');
      } catch (err) {
        console.error('Erreur lors du chargement des gammes :', err);
        setError("Impossible de charger les gammes. Veuillez réessayer.");
      }
    };
    loadGammes();
  }, []);

  const handleCreate = async () => {
    if (!nom.trim() || !description.trim() || !gamme) {
      setError("Tous les champs sont requis !");
      return;
    }
    if (isSubmitting) {
      return; // Empêche une deuxième soumission tant que la première n'est pas terminée
    }
    setIsSubmitting(true); // Marque la soumission comme en cours
    try {
      await onCreate({ nom, description, gamme_id: gamme });
      setError(null);
      onClose();
    } catch (err) {
      setError("Erreur lors de la création du projet. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false); // Réinitialise après la soumission (réussie ou échouée)
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Création d'un projet</h2>
        <label>Nom</label>
        <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} />

        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />

        <label>Gamme</label>
        <select value={gamme} onChange={(e) => setGamme(e.target.value)}>
          {gammes.map((g) => (
            <option key={g.id} value={g.id}>{g.nom}</option>
          ))}
        </select>

        {error && <p className="error-message">{error}</p>}

        <div className="modal-buttons">
          <button onClick={handleCreate} disabled={isSubmitting}>Créer</button>
          <button onClick={onClose}>Annuler</button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;
