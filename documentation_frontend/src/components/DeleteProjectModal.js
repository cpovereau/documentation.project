import React from 'react';
import { notify } from '../utils/notifications';

const DeleteProjectModal = ({ onDelete, project }) => {
  const handleDelete = async () => {
    try {
      await onDelete(project.id);
      notify("Projet supprimé avec succès !", "success");
    } catch (error) {
      notify("Erreur lors de la suppression du projet", "error");
    }
  };

  return (
    <div>
      <p>Voulez-vous vraiment supprimer ce projet ?</p>
      <button onClick={handleDelete}>Supprimer</button>
    </div>
  );
};

export default DeleteProjectModal;
