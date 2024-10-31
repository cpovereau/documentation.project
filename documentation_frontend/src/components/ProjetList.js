// frontend/src/components/ProjetList.js
import React, { useEffect, useState } from 'react';

const ProjetList = () => {
  const [projets, setProjets] = useState([]);
  
  useEffect(() => {
    fetch('http://localhost:8000/api/projets/')
      .then(response => response.json())
      .then(data => setProjets(data))
      .catch(error => console.error('Erreur:', error));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold">Liste des Projets</h2>
      <ul>
        {projets.map(projet => (
          <li key={projet.id}>{projet.nom}</li>
        ))}
      </ul>
    </div>
  );
};

export default ProjetList;
