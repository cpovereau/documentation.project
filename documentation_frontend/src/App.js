// src/App.js
import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import TopBar from './components/Topbar';
import SidebarLeft from './components/SidebarLeft';
import SidebarRight from './components/SidebarRight';
import RichTextEditor from './components/RichTextEditor.js';
import BottomBar from './components/BottomBar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

console.log('Toast Positions disponibles au chargement :', toast.POSITION);

function App() {
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isSidebarRightCollapsed, setSidebarRightCollapsed] = useState(false);
  const [isBottomBarExpanded, setBottomBarExpanded] = useState(true); // État pour contrôler BottomBar

  useEffect(() => {
    if (authToken) {
      localStorage.setItem('authToken', authToken);
      console.log('Token stocké dans localStorage :', authToken);
    } else {
      localStorage.removeItem('authToken');
      console.log('Token supprimé de localStorage');
    }
  }, [authToken]);

  const handleLogout = () => {
    setAuthToken(null);
    localStorage.removeItem('authToken');
    toast.success('Déconnexion réussie !');
    navigate('/login');
  };

  const [questions, setQuestions] = useState([
    {
      label: "Exemple de question",
      answers: [
        { text: "Réponse A", isCorrect: false },
        { text: "Réponse B", isCorrect: true },
      ]
    }
  ]);

  // Styles dynamiques pour editor-container et bottom-bar
  const editorContainerStyle = {
    marginLeft: isSidebarCollapsed ? '60px' : '250px',
    marginRight: isSidebarRightCollapsed ? '0px' : '250px',
  };

  const bottomBarStyle = {
    height: isBottomBarExpanded ? '25vh' : '40px', // Hauteur en fonction de l'état de BottomBar
    transition: 'height 0.3s ease', // Transition douce pour le changement de hauteur
  };

  return (
    <div className="app">
      <ToastContainer />

      {authToken ? (
        <>
          <TopBar user={user} onLogout={handleLogout} />
          
          <div className="main-layout">
            <SidebarLeft 
              isCollapsed={isSidebarCollapsed}
              setCollapsed={setSidebarCollapsed}
              className={`sidebar-left ${isSidebarCollapsed ? '' : 'expanded'}`}
            />

            <div className="editor-container" style={editorContainerStyle}>
              <RichTextEditor />

              {/* BottomBar avec un style conditionnel pour ajuster la hauteur */}
              <BottomBar 
                questions={questions} 
                isSidebarCollapsed={isSidebarCollapsed}
                isSidebarRightCollapsed={isSidebarRightCollapsed}
                isBottomBarExpanded={isBottomBarExpanded}
                setBottomBarExpanded={setBottomBarExpanded}
                style={bottomBarStyle} // Application du style dynamique
              />
            </div>
            
            <SidebarRight 
              isCollapsed={isSidebarRightCollapsed}
              setCollapsed={setSidebarRightCollapsed}
            />
          </div>
        </>
      ) : (
        <div className="auth-container">
          <div className="auth-logo">
            <img src="/assets/logo.jpg" alt="Océalia Informatique" />
          </div>
          
          <div className="auth-form">
            <Routes>
              <Route path="/login" element={<Login setAuthToken={setAuthToken} setUser={setUser} />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
