// =====================================================
// 📂 Fichier : LoginScreen.tsx
// 🔎 Description : Ecran de connexion à l'application
// 🗣️ Tous les commentaires doivent être écrits en français.
// =====================================================

import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// Fonction utilitaire pour récupérer le token CSRF depuis les cookies
function getCSRFToken(): string | undefined {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="))
    ?.split("=")[1];
}

// Composant principal de l'écran de connexion
export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const csrfToken = getCSRFToken();

    try {
      const response = await axios.post(
        "http://localhost:8000/login/",
        { username, password },
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrfToken || "" },
        }
      );

      login(response.data.token, response.data.user);
      toast.success("Connexion réussie !");
      navigate("/desktop");
    } catch (err) {
      console.error("[Login] Échec de la connexion :", err);
      setError("Identifiants invalides");
      toast.error("Échec de la connexion. Veuillez vérifier vos identifiants.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Bloc noir gauche */}
        <div className="bg-black text-white w-80 p-6 flex flex-col items-center justify-center">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-38 h-38 object-contain mb-2"
          />
          <h1 className="text-xl font-bold text-center">Documentum</h1>
        </div>

        {/* Bloc formulaire droit */}
        <div className="p-8 w-96 flex flex-col justify-center">
          <h2 className="text-xl font-bold text-center mb-6">Connexion</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
            />
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            <button
              type="submit"
              className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
