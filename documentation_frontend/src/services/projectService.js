import axios from 'axios';

// Base URL pour les appels API
const baseURL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

/**
 * Récupère la liste des gammes disponibles
 */
export const fetchGammes = async () => {
  const token = localStorage.getItem('authToken'); // Récupération du token utilisateur
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

/**
 * Crée un nouveau projet, la map par défaut est gérée côté backend
 * @param {Object} data - Données du projet à créer
 * @returns {Object} - Projet créé avec la map associée
 */
export const createProject = async (data) => {
  const token = localStorage.getItem('authToken'); // Récupération du token utilisateur
  const headers = {
    Authorization: `Token ${token}`,
    'Content-Type': 'application/json',
  };

  console.log('Token récupéré du localStorage :', token);
  console.log('En-têtes envoyés dans la requête :', headers);
  console.log('Données envoyées au backend :', data);

  try {
    const response = await axios.post(`${baseURL}/api/projet/create/`, data, { headers });
    console.log('Projet créé avec succès :', response.data);
    return response.data; // Retourne le projet et la map associée
  } catch (error) {
    console.error('Erreur lors de la requête :', error);
    if (error.response) {
      console.error("Détails de l'erreur :", error.response.data);
      console.error("Statut de l'erreur :", error.response.status);
    }
    throw error; // Pour que l'erreur soit gérée dans le composant appelant
  }
};

/**
 * Récupère les détails d'un projet spécifique, y compris les maps associées
 * @param {number} projectId - ID du projet
 * @returns {Object} - Détails du projet (incluant maps)
 */
export const fetchProjectById = async (projectId) => {
  const token = localStorage.getItem('authToken');
  const headers = {
    Authorization: `Token ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await axios.get(`${baseURL}/api/projets/${projectId}/details/`, { headers });
    console.log(`Détails du projet récupérés (ID: ${projectId}):`, response.data);
    return response.data; // Assurez-vous que l'API retourne les maps dans la réponse
  } catch (error) {
    console.error('Erreur lors de la récupération des détails du projet :', error);
    throw error;
  }
};

/**
 * Récupère la liste de tous les projets, enrichis avec les maps
 */
export const fetchProjects = async () => {
  const token = localStorage.getItem('authToken'); // Récupération du token utilisateur
  const headers = {
    Authorization: `Token ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await axios.get(`${baseURL}/api/projets/`, { headers });
    console.log('Projets récupérés :', response.data);
    return response.data; // Retourne la liste des projets avec les données associées
  } catch (error) {
    console.error('Erreur lors de la récupération des projets :', error);
    if (error.response) {
      console.error("Détails de l'erreur :", error.response.data);
    }
    throw error; // Propager l'erreur pour gestion dans le frontend
  }
};

/**
 * Récupère tous les projets et enrichit leurs données avec les noms des gammes
 * @param {Array} gammes - Liste des gammes disponibles
 * @returns {Array} - Liste des projets enrichis
 */
export const fetchProjectsWithGammeNames = async (gammes) => {
  try {
    const projects = await fetchProjects(); // Récupération des projets existants

    const enrichedProjects = projects.map((projectWrapper) => {
      const project = projectWrapper.projet; // Assurez-vous que cette clé est correcte
      const gamme = gammes.find((g) => g.id === project.gamme?.id); // Cherche la gamme correspondante

      return {
        ...project,
        gammeNom: gamme ? gamme.nom : 'Gamme inconnue', // Ajoute le nom de la gamme
      };
    });

    console.log('Projets enrichis avec les noms des gammes :', enrichedProjects);
    return enrichedProjects;
  } catch (error) {
    console.error('Erreur lors de la récupération des projets :', error);
    throw error; // Propager l'erreur pour gestion dans le frontend
  }
};

/**
 * Supprime un projet spécifique
 * @param {number} projectId - ID du projet à supprimer
 */
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
