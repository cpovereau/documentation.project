// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = ({ setAuthToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        const data = await response.json();
        setAuthToken(data.token);  // Assignez le token ou session
        localStorage.setItem('authToken', data.token);  // Stocker le token
        toast.success('Connexion réussie !');
        navigate('/');  // Redirection après connexion
      } else {
        toast.error('Nom d’utilisateur ou mot de passe incorrect');
      }
    } catch (error) {
      toast.error("Erreur lors de la connexion");
      console.error(error);
    }
  };

  return (
    <div className="login">
      <h2>Connexion</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Nom d’utilisateur</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Se connecter</button>
      </form>
    </div>
  );
};

export default Login;
