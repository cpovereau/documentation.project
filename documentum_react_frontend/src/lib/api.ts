// src/lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  withCredentials: true,
});

// 🔐 Ajouter le token d'auth s'il est présent
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Token ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 Uniformiser les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    let message = "Erreur inconnue.";
    let fields = {};

    if (data) {
      if (typeof data === "string") {
        message = data;
      } else if (data.error) {
        message = data.error;
      } else if (data.detail) {
        message = data.detail;
      }

      if (data.fields) {
        fields = data.fields;
      } else if (typeof data === "object") {
        // Cas DRF: { champ: ["erreur"] }
        fields = data;
      }
    }

    return Promise.reject({ message, fields, status });
  }
);

export default api;
