import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

export const createProject = async (data) => {
  const token = localStorage.getItem('authToken'); // Récupération du token utilisateur
  const headers = {
    Authorization: `Token ${token}`,
    'Content-Type': 'application/json',
  };

  // Ajoutez les logs ici pour afficher le token et les en-têtes
  console.log('Token récupéré du localStorage :', token);
  console.log('En-têtes envoyés dans la requête :', headers);

  try {
    const response = await axios.post(`${baseURL}/api/projet/create/`, data, { headers });
    console.log('Réponse reçue du serveur :', response);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la requête :', error);
    if (error.response) {
      console.error('Détails de l\'erreur :', error.response.data);
      console.error('Statut de l\'erreur :', error.response.status);
    }
    throw error; // Pour que l'erreur soit gérée dans le composant appelant
  }
};

export const fetchProjects = async () => {
  const token = localStorage.getItem('authToken'); // Récupère le token utilisateur
  const headers = {
    Authorization: `Token ${token}`,
    'Content-Type': 'application/json',
  };

  console.log('Token récupéré du localStorage :', token);

  try {
    const response = await axios.get(`${baseURL}/api/projets/`, { headers });
    console.log('Projets récupérés :', response.data);
    return response.data; // Retourne la liste des projets
  } catch (error) {
    console.error('Erreur lors de la récupération des projets :', error);
    if (error.response) {
      console.error('Détails de l\'erreur :', error.response.data);
    }
    throw error; // Propager l'erreur pour gestion dans le frontend
  }
};

