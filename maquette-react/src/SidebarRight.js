import React from "react";

function SidebarRight({ rubrique }) {
  if (!rubrique) {
    return (
      <div className="sidebar-right bg-gray-100 w-64 p-4 border-l">
        <p className="text-gray-500">Sélectionnez une rubrique pour voir les attributs</p>
      </div>
    );
  }

  return (
    <div className="sidebar-right bg-gray-100 w-64 p-4 border-l">
      <h3 className="font-bold text-lg mb-4">Attributs de la rubrique</h3>
      <ul>
        <li><strong>Titre :</strong> {rubrique.titre}</li>
        <li><strong>Audience :</strong> {rubrique.audience || "Non défini"}</li>
        <li><strong>Fonctionnalité :</strong> {rubrique.fonctionnalite || "Non défini"}</li>
        <li><strong>Version :</strong> {rubrique.version || "Non défini"}</li>
      </ul>
    </div>
  );
}

export default SidebarRight;
