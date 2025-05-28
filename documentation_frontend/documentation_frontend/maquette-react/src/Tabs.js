import React, { useState } from "react";

function Tabs() {
  const [activeTab, setActiveTab] = useState("Rubriques");

  return (
    <div className="tabs-container bg-gray-200 px-4 py-2">
      <div className="tab-buttons flex space-x-4">
        {[
          "Rubriques",
          "Map",
          "Multimédia"
        ].map((tab) => (
          <button
            key={tab}
            className={`tab-button px-4 py-2 rounded ${
              activeTab === tab ? "bg-blue-500 text-white" : "bg-gray-300"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="tab-content mt-4">
        {activeTab === "Rubriques" && <div>Contenu des Rubriques...</div>}
        {activeTab === "Map" && <div>Contenu de la Map...</div>}
        {activeTab === "Multimédia" && <div>Contenu Multimédia...</div>}
      </div>
    </div>
  );
}

export default Tabs;
