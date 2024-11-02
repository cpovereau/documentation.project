// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import Login from './components/Login';
import ProjetList from './components/ProjetList';
import RubriqueForm from './components/RubriqueForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';  // Importez le fichier CSS

function App() {
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));

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
  };

  return (
    <Router>
      <div className="App">
        <ToastContainer />

        {/* Affichage conditionnel de l'interface */}
        {authToken ? (
          <>
            <nav className="navbar">
              <Link to="/projets">Projets</Link>
              <Link to="/rubriques">Rubriques</Link>
              <button onClick={handleLogout}>Déconnexion</button>
            </nav>

            <Routes>
              <Route path="/projets" element={<ProjetList />} />
              <Route path="/rubriques" element={<RubriqueForm />} />
              <Route path="/" element={<Navigate to="/projets" />} />
              <Route path="/login" element={<Navigate to="/projets" />} />
            </Routes>
          </>
        ) : (
          <div className="auth-container">
            <div className="auth-logo">
              <img src="/assets/logo.jpg" alt="Océalia Informatique" />
            </div>
            <div className="auth-form">
              <Routes>
                <Route path="/login" element={<Login setAuthToken={setAuthToken} />} />
                <Route path="*" element={<Navigate to="/login" />} />
              </Routes>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
