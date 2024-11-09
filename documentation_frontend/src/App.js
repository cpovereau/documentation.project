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
  // État pour le jeton d'authentification de l'utilisateur
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
  
  // État pour les informations de l'utilisateur connecté
  const [user, setUser] = useState(null);
  
  // Navigation pour rediriger l'utilisateur
  const navigate = useNavigate();
  
  // États pour gérer la rétractation des barres latérales
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);       // Barre de gauche
  const [isSidebarRightCollapsed, setSidebarRightCollapsed] = useState(false); // Barre de droite

  // Effet pour synchroniser le jeton d'authentification dans le localStorage
  useEffect(() => {
    if (authToken) {
      localStorage.setItem('authToken', authToken);
    } else {
      localStorage.removeItem('authToken');
    }
  }, [authToken]);

  // Fonction de déconnexion : réinitialise le jeton, supprime du localStorage et redirige vers la page de connexion
  const handleLogout = () => {
    setAuthToken(null);
    localStorage.removeItem('authToken');
    toast.success('Déconnexion réussie !');
    navigate('/login');
  };

  // Exemple de données pour la barre de questions en bas
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
      <ToastContainer /> {/* Composant pour afficher les notifications de type "toast" */}

      {/* Vérification de l'authentification : si l'utilisateur est connecté, on affiche l'interface principale */}
      {authToken ? (
        <>
          {/* Barre du haut avec les informations de l'utilisateur et un bouton de déconnexion */}
          <TopBar user={user} onLogout={handleLogout} />
          
          {/* Disposition principale qui contient les barres latérales, l'éditeur et la barre de questions en bas */}
          <div className="main-layout">
            {/* Barre latérale gauche, avec un bouton pour rétracter ou étendre */}
            <SidebarLeft 
              isCollapsed={isSidebarCollapsed} 
              setCollapsed={setSidebarCollapsed} 
            />
            
            {/* Conteneur de l'éditeur avec la barre de questions en bas */}
            <div className={`editor-container ${isSidebarCollapsed ? 'expanded' : ''} ${isSidebarRightCollapsed ? '' : 'right-expanded'}`}>
              {/* Éditeur de texte */}
              <RichTextEditor />
              
              {/* Barre de questions en bas de la page */}
              <BottomBar 
                questions={questions} 
                isSidebarCollapsed={isSidebarCollapsed}
                isSidebarRightCollapsed={isSidebarRightCollapsed}
              />
            </div>
            
            {/* Barre latérale droite, avec un bouton pour rétracter ou étendre */}
            <SidebarRight 
              isCollapsed={isSidebarRightCollapsed} 
              setCollapsed={setSidebarRightCollapsed} 
            />
          </div>
        </>
      ) : (
        // Page d'authentification : affichée uniquement lorsque l'utilisateur n'est pas authentifié
        <div className="auth-container">
          {/* Logo pour la page d'authentification */}
          <div className="auth-logo">
            <img src="/assets/logo.jpg" alt="Océalia Informatique" />
          </div>
          
          {/* Formulaire de connexion */}
          <div className="auth-form">
            <Routes>
              {/* Route pour la page de connexion */}
              <Route path="/login" element={<Login setAuthToken={setAuthToken} setUser={setUser} />} />
              
              {/* Redirection vers /login si l'utilisateur tente d'accéder à une autre page sans être connecté */}
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
