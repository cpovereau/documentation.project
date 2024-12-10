import React from 'react';
import './DeleteProjectModal.css';

const DeleteProjectModal = ({ onClose, onConfirm }) => {
  return (
    <div className="delete-project-modal-overlay">
      <div className="delete-project-modal">
        <h2>Confirmation de Suppression</h2>
        <p>Êtes-vous sûr de vouloir supprimer ce projet ?</p>
        <div className="modal-buttons">
          <button
            className="confirm-button"
            onClick={() => {
              onConfirm(); // Appelle directement la fonction de confirmation passée en prop
            }}
          >
            Supprimer
          </button>
          <button className="cancel-button" onClick={onClose}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProjectModal;
