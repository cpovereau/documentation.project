// src/components/MapDisplay.js
import React from 'react';
import './MapDisplay.css';

const MapDisplay = ({ map }) => {
  if (!map) {
    return <p>Aucune map n'est sélectionnée.</p>;
  }

  return (
    <div className="map-display">
      <h3>{map.nom}</h3>
      <p>Projet ID : {map.projet}</p>
      <p>Maître : {map.is_master ? 'Oui' : 'Non'}</p>
      
      {/* Affichage des rubriques */}
      {map.children && map.children.length > 0 ? (
        <div className="rubric-list">
          <h4>Rubriques :</h4>
          <ul>
            {map.children.map((rubric) => (
              <li key={rubric.id}>{rubric.name}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Aucune rubrique n'est ajoutée à cette map.</p>
      )}
    </div>
  );
};

export default MapDisplay;
