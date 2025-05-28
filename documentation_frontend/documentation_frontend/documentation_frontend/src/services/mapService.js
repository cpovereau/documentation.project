// src/services/mapService.js
import axios from 'axios';
import { notify } from '../utils/notifications';
const baseURL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

/**
 * Crée une nouvelle Map.
 * @param {Object} data - Les données de la Map (nom, projet, etc.).
 */
export const createMap = async (data) => {
  const token = localStorage.getItem('authToken'); // Récupération du token utilisateur
  const headers = {
    Authorization: `Token ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await axios.post(`${baseURL}/api/maps/`, data, { headers });
    notify('Map créée avec succès !', 'success');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de la Map :', error);
    if (error.response) {
      notify(error.response.data?.message || 'Erreur lors de la création.', 'error');
    }
    throw error;
  }
};
