import React from "react";

function Sidebar({ setActiveRubrique }) {
  const mapRubriques = [
    { id: 1, titre: "Introduction" },
    { id: 2, titre: "Fonctionnalités" },
    { id: 3, titre: "Configuration" },
    { id: 4, titre: "FAQ" }
  ];

  return (
    <div className="sidebar bg-gray-100 w-64 p-4 flex flex-col border-r">
      <h2 className="text-lg font-bold mb-4">Projets</h2>
      <div className="project-actions mb-6">
        <button className="btn-add bg-blue-500 text-white px-3 py-2 rounded mb-2 w-full">+ Nouveau projet</button>
        <button className="btn bg-gray-300 px-3 py-2 rounded mb-2 w-full">Ouvrir un projet</button>
        <button className="btn bg-gray-300 px-3 py-2 rounded mb-2 w-full">Dupliquer un projet</button>
      </div>

      <h2 className="text-lg font-bold mb-4">Map</h2>
      <ul className="rubrique-list pl-4">
        {mapRubriques.map((rubrique) => (
          <li
            key={rubrique.id}
            className="rubrique-item p-2 hover:bg-gray-200 cursor-pointer relative"
            onClick={() => setActiveRubrique(rubrique)}
          >
            {rubrique.titre}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;
