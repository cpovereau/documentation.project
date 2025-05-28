import React, { useState } from 'react';
import ProjectContainer from './ProjectContainer';
import MapsContainer from './MapsContainer';
import { FaFolder, FaSitemap, FaBars } from 'react-icons/fa';
import './SidebarLeft.css';

const SidebarLeft = ({ isCollapsed, setCollapsed }) => {
  // État pour le projet actif et les maps
  const [activeProject, setActiveProject] = useState(null);
  const [maps, setMaps] = useState([]);

  return (
    <div className={`sidebar-left ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Bouton menu sandwich pour étendre/rétracter la barre */}
      <button className="toggle-button" onClick={() => setCollapsed(!isCollapsed)}>
        <FaBars />
      </button>

      {/* Container "Projet" */}
      <div className="sidebar-item">
        <div
          className="sidebar-item-header"
          onClick={() => setCollapsed(false)}
        >
          <FaFolder className="icon" />
          {!isCollapsed && <span>Projet</span>}
        </div>
        {!isCollapsed && (
          <ProjectContainer
            activeProject={activeProject}
            setActiveProject={setActiveProject}
            setMaps={setMaps} // Passe la gestion des maps
          />
        )}
      </div>

      {/* Container "Maps" */}
      <div className="sidebar-item">
        <div
          className="sidebar-item-header"
          onClick={() => setCollapsed(false)}
        >
          <FaSitemap className="icon" />
          {!isCollapsed && <span>Maps</span>}
        </div>
        {!isCollapsed && (
          <MapsContainer
            currentProject={activeProject} // Passe le projet actif
            maps={maps} // Passe les maps associées
          />
        )}
      </div>
    </div>
  );
};

export default SidebarLeft;
