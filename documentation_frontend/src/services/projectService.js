import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

export const fetchGammes = async () => {
  const token = localStorage.getItem('authToken'); // Récupère le token utilisateur
  const headers = {
    Authorization: `Token ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await axios.get(`${baseURL}/api/gammes/`, { headers });
    console.log('Gammes récupérées :', response.data);
    return response.data; // Retourne la liste des gammes
  } catch (error) {
    console.error('Erreur lors de la récupération des gammes :', error);
    if (error.response) {
      console.error("Détails de l'erreur :", error.response.data);
    }
    throw error; // Propager l'erreur pour gestion dans le frontend
  }
};

export const createProject = async (data) => {
  const token = localStorage.getItem('authToken'); // Récupération du token utilisateur
  const headers = {
    Authorization: `Token ${token}`,
    'Content-Type': 'application/json',
  };

  // Ajoutez les logs ici pour afficher le token et les en-têtes
  console.log('Token récupéré du localStorage :', token);
  console.log('En-têtes envoyés dans la requête :', headers);
  console.log('Données envoyées au backend :', data);

  try {
    // Création du projet avec la map gérée côté backend
    const response = await axios.post(`${baseURL}/api/projet/create/`, data, { headers });
    console.log('Projet créé avec succès :', response.data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la requête :', error);
    if (error.response) {
      console.error("Détails de l'erreur :", error.response.data);
      console.error("Statut de l'erreur :", error.response.status);
    }
    throw error; // Pour que l'erreur soit gérée dans le composant appelant
  }
};

export const fetchProjectById = async (projectId) => {
  const token = localStorage.getItem('authToken'); // Récupération du token utilisateur
  const headers = {
    Authorization: `Token ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await axios.get(`${baseURL}/api/projets/${projectId}/details/`, { headers });
    console.log(`Projet récupéré (ID: ${projectId}) :`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération du projet ${projectId} :`, error);
    if (error.response) {
      console.error('Détails de l\'erreur :', error.response.data);
    }
    throw error; // Propager l'erreur pour gestion dans le frontend
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
      console.error("Détails de l'erreur :", error.response.data);
    }
    throw error; // Propager l'erreur pour gestion dans le frontend
  }
};

export const fetchProjectsWithGammeNames = async (gammes) => {
  try {
    // Récupération des projets existants
    const projects = await fetchProjects();

    // Enrichissement des projets avec les noms des gammes
    const enrichedProjects = projects.map((project) => {
      const gamme = gammes.find((g) => g.id === project.gamme_id); // Cherche la gamme correspondante par gamme_id
      return {
        ...project,
        gammeNom: gamme ? gamme.nom : 'Gamme inconnue', // Ajoute le nom de la gamme ou 'Gamme inconnue' si absente
      };
    });

    console.log('Projets enrichis avec les noms des gammes :', enrichedProjects);
    return enrichedProjects;
  } catch (error) {
    console.error('Erreur lors de la récupération des projets :', error);
    throw error; // Propager l'erreur pour gestion dans le frontend
  }
};

export const deleteProject = async (projectId) => {
  const token = localStorage.getItem('authToken'); // Récupération du token utilisateur
  const headers = {
    Authorization: `Token ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await axios.delete(`${baseURL}/api/projets/${projectId}/`, { headers });
    console.log(`Projet ${projectId} supprimé avec succès.`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la suppression du projet ${projectId} :`, error);
    if (error.response) {
      console.error("Détails de l'erreur :", error.response.data);
    }
    throw error; // Propager l'erreur pour gestion dans le frontend
  }
};
