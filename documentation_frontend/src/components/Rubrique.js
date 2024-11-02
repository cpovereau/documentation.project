// frontend/src/components/Rubrique.js
import React from 'react';

const Rubrique = ({ contenuXml }) => {
  return (
    <div dangerouslySetInnerHTML={{ __html: contenuXml }} />
  );
};

export default Rubrique;
