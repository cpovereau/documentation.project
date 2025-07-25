import axios from "axios";
import { toast } from "sonner";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});


// Fonction utilitaire pour obtenir un cookie par son nom
function getCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : undefined;
}

// Interceptor pour ajouter le token CSRF aux requêtes POST, PUT, PATCH, DELETE
api.interceptors.request.use((config) => {
  const method = config.method?.toUpperCase();
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method || "")) {
    const csrfToken = getCookie("csrftoken");
    if (csrfToken) {
      config.headers["X-CSRFToken"] = csrfToken;
    }
  }
  return config;
});

// Interceptor pour gérer les erreurs globalement
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const message =
  error.response?.data?.error ||
  error.response?.statusText ||
  `Erreur ${error.response?.status}` ||
  "Erreur inconnue";
    const fields = error.response?.data?.fields || null;

    if (status === 401) {
  const { useSessionStore } = await import("@/store/useSessionStore");
  useSessionStore.getState().setExpired(true);

  const sessionToastId = "session-expired"; // ✅ Définir l'ID ici
  toast.error("Votre session a expiré. Veuillez vous reconnecter.", {
    id: sessionToastId,
  });
}

    return Promise.reject({ message, fields, status });
  }
);

