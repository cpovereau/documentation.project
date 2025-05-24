// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import logo from '../assets/logo.jpg';

const Login = ({ setAuthToken, setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }
    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log("Status de la réponse:", response.status);

      if (response.ok) {
        try {
          const data = await response.json();
          console.log("Data reçue:", data);

          if (data.token) {
            setAuthToken(data.token);
            localStorage.setItem('authToken', data.token);
            setUser({ name: data.user.last_name, firstName: data.user.first_name, email: data.user.email });
            toast.success('Connexion réussie !');
            navigate('/');
          } else {
            toast.error("Le token est manquant dans la réponse.");
          }
        } catch (jsonError) {
          toast.error("Erreur de décodage de la réponse JSON");
          console.error("Erreur JSON:", jsonError);
        }
      } else {
        toast.error("Nom d’utilisateur ou mot de passe incorrect");
      }
    } catch (error) {
      toast.error("Erreur lors de la connexion");
      console.error("Erreur dans handleLogin:", error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-logo">
        <img src={logo} alt="Logo" />
      </div>
      <div className="auth-form">
        <h2>Connexion</h2>
        <form onSubmit={handleLogin}>
          <div>
            <label htmlFor="username">Nom d’utilisateur</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit">Se connecter</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
