// src/components/CreateProjectModal.js
import React, { useState } from 'react';
import './CreateProjectModal.css';

const CreateProjectModal = ({ onClose, onCreate }) => {
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [gamme, setGamme] = useState('Hébergement');
  const [error, setError] = useState(null);

const handleCreate = async () => {
  if (!nom.trim() || !description.trim() || !gamme) {
    setError("Tous les champs sont requis !");
    return;
  }
  try {
    await onCreate({ nom, description, gamme });
    setError(null);
    onClose();
  } catch (err) {
    setError("Erreur lors de la création du projet. Veuillez réessayer.");
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
          <option value="Hébergement">Hébergement</option>
          <option value="Usager">Usager</option>
          <option value="Planning">Planning</option>
        </select>

        {error && <p className="error-message">{error}</p>}

        <div className="modal-buttons">
          <button onClick={handleCreate}>Créer</button>
          <button onClick={onClose}>Annuler</button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;
