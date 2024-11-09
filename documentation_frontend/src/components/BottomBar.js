// src/components/BottomBar.js
import React from 'react';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import './BottomBar.css';

const BottomBar = ({ questions, isBottomBarExpanded, setBottomBarExpanded, style }) => {
  return (
    <div className="bottom-bar" style={style}>
      <button className="toggle-button" onClick={() => setBottomBarExpanded(!isBottomBarExpanded)}>
        {isBottomBarExpanded ? <FaChevronDown /> : <FaChevronUp />}
      </button>

      {isBottomBarExpanded && (
        <div className="questions-content">
          {questions.map((question, index) => (
            <div key={index} className="question-item">
              <p><strong>Q: {question.label}</strong></p>
              {question.answers.map((answer, i) => (
                <p key={i}>R: {answer.text} {answer.isCorrect ? '✔️' : ''}</p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BottomBar;
