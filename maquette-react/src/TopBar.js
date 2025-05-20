import React from "react";

function TopBar({ toggleSidebar }) {
  return (
    <div className="top-bar bg-gray-800 text-white px-4 py-2 flex justify-between items-center">
      <button
        className="menu-button text-lg"
        onClick={toggleSidebar}
      >
        ☰
      </button>

      <div className="user-info flex items-center">
        <span className="mr-4">Bienvenue, Admin</span>
        <button className="logout-button bg-red-500 px-3 py-1 rounded">Déconnexion</button>
      </div>
    </div>
  );
}

export default TopBar;