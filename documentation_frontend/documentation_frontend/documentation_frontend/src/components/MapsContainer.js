import React, { useEffect } from 'react';
import './MapsContainer.css';

const MapsContainer = ({ currentProject, maps }) => {
  useEffect(() => {
    console.log("MapsContainer received project:", currentProject);
    console.log("MapsContainer received maps:", maps);
  }, [currentProject, maps]);

  return (
    <div className="maps-container">
      <h3>Maps pour le projet : {currentProject ? currentProject.nom : 'Aucun projet sélectionné'}</h3>
      {maps && maps.length > 0 ? (
        <ul>
          {maps.map((map) => (
            <li key={map.id}>
              {map.nom} - {map.is_master ? 'Master' : 'Standard'}
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucune map disponible pour ce projet.</p>
      )}
    </div>
  );
};

export default MapsContainer;
