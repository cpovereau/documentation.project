// src/components/SidebarLeft.js
import React, { useState, useCallback } from 'react';
import ProjectContainer from './ProjectContainer';
import MapsContainer from './MapsContainer';
import { FaFolder, FaSitemap, FaBars } from 'react-icons/fa';
import './SidebarLeft.css';

const SidebarLeft = ({ isCollapsed, setCollapsed }) => {
  const [isProjectOpen, setProjectOpen] = useState(true);
  const [isMapsOpen, setMapsOpen] = useState(true);

  return (
    <div className={`sidebar-left ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Bouton burger dans la barre latérale */}
      <button className="toggle-button" onClick={() => setCollapsed(!isCollapsed)}>
        <FaBars />
      </button>

      {/* Container "Projet" */}
      <div className="sidebar-item">
        <div className="sidebar-item-header" onClick={() => setProjectOpen(!isProjectOpen)}>
          <FaFolder className="icon" />
          {!isCollapsed && <span>Projet</span>}
        </div>
        {isProjectOpen && !isCollapsed && <ProjectContainer />}
      </div>

      {/* Container "Maps" */}
      <div className="sidebar-item">
        <div className="sidebar-item-header" onClick={() => setMapsOpen(!isMapsOpen)}>
          <FaSitemap className="icon" />
          {!isCollapsed && <span>Maps</span>}
        </div>
        {isMapsOpen && !isCollapsed && <MapsContainer />}
      </div>
    </div>
  );
};

export default SidebarLeft;
