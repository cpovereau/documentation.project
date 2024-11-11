// src/components/VideosContainer.js
import React from 'react';
import './VideosContainer.css';

const VideosContainer = () => {
  return (
    <div className="videos-container">
      <select>
        <option value="">Sélectionnez une vidéo</option>
      </select>
      <div className="video-list">
        {/* Liste des vidéos disponibles */}
      </div>
    </div>
  );
};

export default VideosContainer;
