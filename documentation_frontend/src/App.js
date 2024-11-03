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

function App() {
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  
  // Collapsible state for sidebars
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSidebarRightCollapsed, setSidebarRightCollapsed] = useState(true);

  useEffect(() => {
    if (authToken) {
      localStorage.setItem('authToken', authToken);
    } else {
      localStorage.removeItem('authToken');
    }
  }, [authToken]);

  const handleLogout = () => {
    setAuthToken(null);
    localStorage.removeItem('authToken');
    toast.success('Déconnexion réussie !');
    navigate('/login');
  };

  // Sample questions state for BottomBar
  const [questions, setQuestions] = useState([
    {
      label: "Exemple de question",
      answers: [
        { text: "Réponse A", isCorrect: false },
        { text: "Réponse B", isCorrect: true },
      ]
    }
  ]);

  return (
    <div className="app">
      <ToastContainer />

      {authToken ? (
        <>
          {/* Top Navigation Bar */}
          <TopBar user={user} onLogout={handleLogout} />
          
          {/* Main Layout with Sidebars, Editor, and BottomBar */}
          <div className="main-content">
            <SidebarLeft isCollapsed={isSidebarCollapsed} setCollapsed={setSidebarCollapsed} />
            
            {/* Editor and BottomBar Container */}
            <div className={`editor-container ${isSidebarCollapsed ? 'expanded' : ''}`}>
              <RichTextEditor />
              <BottomBar questions={questions} />
            </div>
            
            {!isSidebarRightCollapsed && window.innerWidth > 768 && (
            <SidebarRight isCollapsed={isSidebarRightCollapsed} setCollapsed={setSidebarRightCollapsed} />
          )}
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
