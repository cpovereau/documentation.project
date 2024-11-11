// src/components/AttributesContainer.js
// src/components/AttributesContainer.js
import React from 'react';
import './AttributesContainer.css';

const AttributesContainer = () => {
  return (
    <div className="attributes-container">
      <table>
        <tbody>
          <tr><td>Gamme</td><td></td></tr>
          <tr><td>Produit</td><td></td></tr>
          <tr><td>Auteur</td><td></td></tr>
          <tr><td>Date Création</td><td></td></tr>
          <tr><td>Date Mise à jour</td><td></td></tr>
          <tr><td>Fonctionnalité</td><td></td></tr>
          <tr><td>Audience</td><td></td></tr>
          <tr><td>Version N°</td><td></td></tr>
        </tbody>
      </table>
    </div>
  );
};

export default AttributesContainer;
