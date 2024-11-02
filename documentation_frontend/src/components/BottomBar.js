// src/components/BottomBar.js
import React, { useState } from 'react';

const BottomBar = () => {
  const [isQuestionsOpen, setQuestionsOpen] = useState(true);

  return (
    <div className={`bottom-bar ${isQuestionsOpen ? 'open' : 'closed'}`}>
      <div onClick={() => setQuestionsOpen(!isQuestionsOpen)}>
        Questions
      </div>
      {isQuestionsOpen && <div className="questions-content">Contenu des questions ici</div>}
    </div>
  );
};

export default BottomBar;
