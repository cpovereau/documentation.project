import axios from "axios";
import {
  ProjectReadSchema,
  CreateProjectResponseSchema,
  type ProjectReadZ,
  type CreateProjectResponseZ,
  parseOrThrow,
} from "@/types/api.zod";
export const API_BASE = "/api";

// Création d'une instance Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  withCredentials: true,
});

// Fonction utilitaire pour lire les cookies
function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const cookies = document.cookie.split(";").map(c => c.trim());
  const target = cookies.find((c) => c.startsWith(`${name}=`));
  return target?.split("=")[1];
}

// 🔐 Ajouter le token d'auth s'il est présent
api.interceptors.request.use((config) => {
  const method = config.method?.toUpperCase();
  const isModifying = ["POST", "PUT", "PATCH", "DELETE"].includes(method || "");

  // --- 🔐 Authentification : ajoute le token si présent dans le localStorage
  const token = localStorage.getItem("token");
  if (token) {
    // Axios v1+ : headers peut être une instance complexe -> .set() est préférable
    if (config.headers && typeof config.headers.set === "function") {
      config.headers.set("Authorization", `Token ${token}`);
    } else {
      // fallback pour TypeScript strict
      (config.headers as any)["Authorization"] = `Token ${token}`;
    }
  }

  // --- 🛡️ CSRF : ajoute le token CSRF uniquement pour les méthodes sensibles
  const csrfToken = getCookie("csrftoken");
  if (isModifying && csrfToken) {
    if (config.headers && typeof config.headers.set === "function") {
      config.headers.set("X-CSRFToken", csrfToken);
    } else {
      (config.headers as any)["X-CSRFToken"] = csrfToken;
    }
    console.log("✅ X-CSRFToken injecté :", csrfToken);
  }

  // --- ⚠️ multipart : supprime Content-Type si FormData (Axios le recrée automatiquement)
  if (
    config.data instanceof FormData &&
    config.headers &&
    typeof config.headers.delete === "function"
  ) {
    config.headers.delete("Content-Type"); // ⚠️ sinon le boundary casse le POST
  }

  return config;
});

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

// --- Création de projet avec sa version initiale et map racine ---
export async function createProjectValidated(payload: {
  nom: string; description: string; gamme_id: number;
}): Promise<CreateProjectResponseZ> {
  const res = await api.post("/projet/create/", payload);
  return parseOrThrow(CreateProjectResponseSchema, res.data, "CreateProject: payload serveur inattendu");
}

// --- Récupération des détails d’un projet (projet + gamme + versions + maps) ---
export async function getProjectDetailsValidated(id: number): Promise<ProjectReadZ> {
  const res = await api.get(`/projets/${id}/details/`);
  return parseOrThrow(ProjectReadSchema, res.data, "ProjectDetails: payload serveur inattendu");
}

export default api;