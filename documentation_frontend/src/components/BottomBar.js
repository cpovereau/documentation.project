// src/components/BottomBar.js
import React, { useState } from 'react';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import './BottomBar.css';

const BottomBar = ({ questions, isSidebarCollapsed, isSidebarRightCollapsed }) => {
  const [isExpanded, setExpanded] = useState(true);

  return (
    <div
      className={`bottom-bar ${isExpanded ? 'expanded' : 'collapsed'} ${
        isSidebarCollapsed ? 'left-expanded' : ''
      } ${isSidebarRightCollapsed ? '' : 'right-expanded'}`}
    >
      <button className="toggle-button" onClick={() => setExpanded(!isExpanded)}>
        {isExpanded ? <FaChevronDown /> : <FaChevronUp />}
      </button>

      <div className="questions-content">
        {questions.map((question, questionIndex) => (
          <div key={questionIndex} className="question-item">
            <strong>Q: {question.label}</strong>
            {question.answers.map((answer, answerIndex) => (
              <div key={answerIndex} className="answer-item">
                <span>R: {answer.text}</span>
                <input
                  type="checkbox"
                  checked={answer.isCorrect}
                  onChange={() => question.toggleCorrectAnswer(questionIndex, answerIndex)}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BottomBar;
