import React, { useState } from 'react';
import { FaPlus, FaFolder, FaArrowRight, FaArrowLeft, FaTrash, FaBook } from 'react-icons/fa';
import { createMap } from '../services/mapService';
import './MapsContainer.css';

const MapsContainer = ({ isProjectLoaded, currentProject, maps, setMaps }) => {
  const [treeData, setTreeData] = useState([{ id: 1, name: 'Root', children: [] }]);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleCreateMap = async () => {
    if (!isProjectLoaded || !currentProject) {
      return alert("Veuillez charger un projet avant de créer une Map.");
    }

    const mapName = prompt("Nom de la nouvelle Map :");
    if (!mapName) return;

    try {
      const newMap = await createMap({ nom: mapName, projet: currentProject.id });
      setMaps([...maps, newMap]); // Mise à jour de l'état avec la nouvelle Map
    } catch (error) {
      console.error("Erreur lors de la création de la Map :", error);
    }
  };

  // Gestion des actions de la barre d'outils
  const addNewRubric = () => {
    if (!isProjectLoaded) return;
    const newRubric = { id: Date.now(), name: 'Nouvelle Rubrique', children: [] };
    setTreeData([...treeData, newRubric]);
  };

  const addExistingRubric = () => {
    if (!isProjectLoaded) return;
    // Ajout logique pour ajouter une rubrique existante à l'arbre
  };

  const moveRight = () => {
    if (!selectedItem || selectedItem.id === 1) return; // Ne rien faire pour Root ou si rien n'est sélectionné
    // Logique pour décaler une rubrique vers un niveau supérieur
  };

  const moveLeft = () => {
    if (!selectedItem || selectedItem.id === 1) return;
    // Logique pour descendre la rubrique d'un niveau
  };

  const deleteRubric = () => {
    if (!selectedItem || selectedItem.id === 1) return;
    setTreeData(treeData.filter(item => item.id !== selectedItem.id));
    setSelectedItem(null);
  };

  const publishMap = () => {
    if (!isProjectLoaded) return;
    // Logique pour publier une map
  };

  // Arborescence de l'arbre
  const renderTree = (nodes) => (
    <ul>
      {nodes.map(node => (
        <li key={node.id} onClick={() => setSelectedItem(node)} style={{ cursor: 'pointer' }}>
          {node.name}
          {node.children && renderTree(node.children)}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="maps-container">
      <div className="toolbar">
        <FaPlus onClick={handleCreateMap} style={{ cursor: 'pointer' }} />
        <FaFolder onClick={addExistingRubric} style={{ cursor: 'pointer' }} />
        <FaArrowRight onClick={moveRight} style={{ cursor: 'pointer' }} />
        <FaArrowLeft
          onClick={moveLeft}
          style={{ cursor: selectedItem && selectedItem.id !== 1 ? 'pointer' : 'not-allowed' }}
        />
        <FaTrash
          onClick={deleteRubric}
          style={{ cursor: selectedItem && selectedItem.id !== 1 ? 'pointer' : 'not-allowed' }}
        />
        <FaBook onClick={publishMap} style={{ cursor: 'pointer' }} />
      </div>
      <div className="tree-content">
        {isProjectLoaded ? renderTree(treeData) : <p>Veuillez charger un projet pour voir les maps.</p>}
      </div>
    </div>
  );
};

export default MapsContainer;
