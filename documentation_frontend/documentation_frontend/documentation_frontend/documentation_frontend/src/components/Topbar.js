// src/components/TopBar.js
import React, { useState } from 'react';
import { FaUserCircle } from 'react-icons/fa'; // Importez une icône de profil

const defaultUser = {
  firstName: "Invité",
  name: "",
  email: "non défini",
  profile: "utilisateur",
};

const TopBar = ({ user = defaultUser, onLogout }) => {
  const [isUserModalOpen, setUserModalOpen] = useState(false);

  return (
    <div className="topbar">
      <div className="user-info">
        {/* Icône de profil à gauche */}
        <FaUserCircle size={24} style={{ marginRight: '8px' }} />
        
        {/* Bouton pour afficher le nom de l'utilisateur et ouvrir le modal */}
        <button 
          onClick={() => setUserModalOpen(!isUserModalOpen)} 
          style={{ marginRight: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#333', fontSize: '1rem' }}
        >
          {user.firstName || "Invité"} {user.name|| ""}
        </button>

        {/* Modal d'informations utilisateur */}
        {isUserModalOpen && (
          <div className="user-modal">
            <p>Nom : {user.name || "Non défini"}</p>
            <p>Prénom : {user.firstName || "Non défini"}</p>
            <p>Email : {user.email|| "Non défini"}</p>
            <p>Profil : {user.profile|| "Non défini"}</p>
            <button onClick={() => setUserModalOpen(false)}>Enregistrer</button>
            {user.profile === 'admin' && <button>Gérer les comptes</button>}
          </div>
        )}
      </div>

      {/* Bouton de déconnexion */}
      <button onClick={onLogout} className="logout-button">Déconnexion</button>
    </div>
  );
};

export default TopBar;
