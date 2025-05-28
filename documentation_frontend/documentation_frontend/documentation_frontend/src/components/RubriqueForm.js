// src/components/RubriqueForm.js
import React, { useState } from 'react';
import RichTextEditor from './RichTextEditor';
import { toast } from 'react-toastify';

const RubriqueForm = () => {
  const [titre, setTitre] = useState('');
  const [contenuXml, setContenuXml] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const rubrique = {
      titre,
      contenu_xml: contenuXml,
    };

    try {
      const response = await fetch('http://localhost:8000/api/rubriques/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rubrique),
      });

      if (response.ok) {
        toast.success('Rubrique créée avec succès');
      } else {
        toast.error('Erreur lors de la création de la rubrique');
      }
    } catch (error) {
      toast.error('Erreur réseau');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Titre</label>
        <input
          type="text"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
        />
      </div>
      <div>
        <label>Contenu</label>
        <RichTextEditor value={contenuXml} onChange={setContenuXml} />
      </div>
      <button type="submit">Enregistrer</button>
    </form>
  );
};

export default RubriqueForm;
