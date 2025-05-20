import React from "react";

function QuestionsExercises({ rubrique }) {
  if (!rubrique) {
    return (
      <div className="questions-exercises bg-gray-50 border-t p-4">
        <p className="text-gray-500">Sélectionnez une rubrique pour gérer les questions et exercices.</p>
      </div>
    );
  }

  return (
    <div className="questions-exercises bg-gray-50 border-t p-4">
      <h3 className="font-bold text-lg mb-4">Questions et Exercices</h3>
      <div className="questions">
        <h4 className="font-semibold mb-2">Questions</h4>
        <ul>
          <li>Question 1...</li>
          <li>Question 2...</li>
        </ul>
      </div>
      <div className="exercises mt-4">
        <h4 className="font-semibold mb-2">Exercices</h4>
        <ul>
          <li>Exercice 1...</li>
          <li>Exercice 2...</li>
        </ul>
      </div>
    </div>
  );
}

export default QuestionsExercises;
