// src/components/ImagesContainer.js
import React from 'react';
import './ImagesContainer.css';

const ImagesContainer = () => {
  return (
    <div className="images-container">
      <select>
        <option value="">Sélectionnez une image</option>
      </select>
      <div className="image-list">
        {/* Liste des images disponibles */}
      </div>
    </div>
  );
};

export default ImagesContainer;
