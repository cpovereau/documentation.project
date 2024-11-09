// src/components/RichTextEditor.js
import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { checkGrammar } from '../utils/LanguageTool';
import './RichTextEditor.css';

const RichTextEditor = ({ value, onChange }) => {
  const [errors, setErrors] = useState([]);

  const handleCheckGrammar = async () => {
    try {
      const grammarErrors = await checkGrammar(value);
      setErrors(grammarErrors);  // Affiche les erreurs trouvées
    } catch (error) {
      console.error("Erreur lors de la vérification grammaticale:", error);
    }
  };
  
  const modules = {
    toolbar: [
      [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
      [{ 'bold': 'Bold', 'italic': 'Italic', 'underline': 'Underline' }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean'], // Supprime la mise en forme
    ],
  };

  return (
    <div>
      <ReactQuill
        value={value}
        onChange={onChange}
        modules={modules}
        theme="snow"
        placeholder="Rédigez votre contenu ici..."
        spellCheck={true}  // Active la correction orthographique du navigateur
      />
      <button onClick={handleCheckGrammar}>Vérifier la grammaire</button>
      <div>
        {errors.length > 0 && (
          <ul>
            {errors.map((error, index) => (
              <li key={index}>
                Erreur : {error.message}, suggestion : {error.replacements.map(r => r.value).join(', ')}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;
