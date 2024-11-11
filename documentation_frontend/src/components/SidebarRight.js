// src/components/SidebarRight.js
import React, { useState } from 'react';
import { FaSearch, FaImage, FaVideo, FaBars } from 'react-icons/fa';
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
      {/* Bouton burger dans la barre latérale */}
      <button className="toggle-button" onClick={() => setCollapsed(!isCollapsed)}>
        <FaBars />
      </button>

      {/* Container "Attributs" */}
      <div className="sidebar-item">
        <div className="sidebar-item-header" onClick={() => setAttributesOpen(!isAttributesOpen)}>
          <FaSearch className="icon" />
          {!isCollapsed && <span>Attributs</span>}
        </div>
        {isAttributesOpen && !isCollapsed && <AttributesContainer />}
      </div>

      {/* Container "Images" */}
      <div className="sidebar-item">
        <div className="sidebar-item-header" onClick={() => setImagesOpen(!isImagesOpen)}>
          <FaImage className="icon" />
          {!isCollapsed && <span>Images</span>}
        </div>
        {isImagesOpen && !isCollapsed && <ImagesContainer />}
      </div>

      {/* Container "Vidéos" */}
      <div className="sidebar-item">
        <div className="sidebar-item-header" onClick={() => setVideosOpen(!isVideosOpen)}>
          <FaVideo className="icon" />
          {!isCollapsed && <span>Vidéos</span>}
        </div>
        {isVideosOpen && !isCollapsed && <VideosContainer />}
      </div>
    </div>
  );
};

export default SidebarRight;
