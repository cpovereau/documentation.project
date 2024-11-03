// src/components/SidebarRight.js
import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './SidebarRight.css';

const SidebarRight = ({ isCollapsed, setCollapsed }) => {
  return (
    <div className={`sidebar-right ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Bouton de repli pour masquer ou afficher la SidebarRight */}
      <button className="toggle-button" onClick={() => setCollapsed(!isCollapsed)}>
        {isCollapsed ? <FaChevronLeft /> : <FaChevronRight />}
      </button>

      {/* Contenu de SidebarRight */}
      {!isCollapsed && (
        <div className="content">
          <div className="sidebar-section">
            <div className="sidebar-section-header">
              <span>Attributs</span>
            </div>
            <div className="sidebar-section-content">
              <p>Attribut 1 : Valeur</p>
              <p>Attribut 2 : Valeur</p>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-header">
              <span>Images</span>
            </div>
            <div className="sidebar-section-content">
              <p>Image 1</p>
              <p>Image 2</p>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-header">
              <span>Vidéos</span>
            </div>
            <div className="sidebar-section-content">
              <p>Vidéo 1</p>
              <p>Vidéo 2</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarRight;
