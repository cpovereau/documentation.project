// src/components/SidebarRight.js
import React, { useState } from 'react';
import { FaSearch, FaImage, FaVideo, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import AttributesContainer from './AttributesContainer';
import ImagesContainer from './ImagesContainer';
import VideosContainer from './VideosContainer';
import './SidebarRight.css';

const SidebarRight = ({ isCollapsed, setCollapsed }) => {
  const [isAttributesOpen, setAttributesOpen] = useState(false);
  const [isImagesOpen, setImagesOpen] = useState(false);
  const [isVideosOpen, setVideosOpen] = useState(false);

  return (
    <div className={`sidebar-right ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Bouton de flèche pour étendre/rétracter la barre */}
      <button className="toggle-button" onClick={() => setCollapsed(!isCollapsed)}>
        {isCollapsed ? <FaChevronLeft /> : <FaChevronRight />} {/* Flèche pour déployer/rétracter */}
      </button>

      {/* Container "Attributs" */}
      <div className="sidebar-item">
        <div
          className="sidebar-item-header"
          onClick={() => {
            setAttributesOpen(!isAttributesOpen);
            if (isCollapsed) setCollapsed(false); // Déploie la barre si compacte
          }}
        >
          <FaSearch className="icon" />
          {!isCollapsed && <span>Attributs</span>}
        </div>
        {isAttributesOpen && !isCollapsed && <AttributesContainer />}
      </div>

      {/* Container "Images" */}
      <div className="sidebar-item">
        <div
          className="sidebar-item-header"
          onClick={() => {
            setImagesOpen(!isImagesOpen);
            if (isCollapsed) setCollapsed(false); // Déploie la barre si compacte
          }}
        >
          <FaImage className="icon" />
          {!isCollapsed && <span>Images</span>}
        </div>
        {isImagesOpen && !isCollapsed && <ImagesContainer />}
      </div>

      {/* Container "Vidéos" */}
      <div className="sidebar-item">
        <div
          className="sidebar-item-header"
          onClick={() => {
            setVideosOpen(!isVideosOpen);
            if (isCollapsed) setCollapsed(false); // Déploie la barre si compacte
          }}
        >
          <FaVideo className="icon" />
          {!isCollapsed && <span>Vidéos</span>}
        </div>
        {isVideosOpen && !isCollapsed && <VideosContainer />}
      </div>
    </div>
  );
};

export default SidebarRight;
