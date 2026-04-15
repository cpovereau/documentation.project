import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User as UserType } from "@/types/User";

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("authToken")
  );
  const [user, setUser] = useState<UserType | null>(null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  // ⏱️ Timeout après 30 minutes d'inactivité (en millisecondes)
  const TIMEOUT = 30 * 60 * 1000;

  // 🎯 Auto-logout si inactif trop longtemps
  useEffect(() => {
    const interval = setInterval(() => {
      if (token && Date.now() - lastActivity > TIMEOUT) {
        logout();
      }
    }, 60000); // vérifie toutes les minutes

    return () => clearInterval(interval);
  }, [lastActivity, token]);

  // 🧠 Enregistre le token en localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
  }, [token]);

  // 🖱️ Met à jour l'activité à chaque interaction
  useEffect(() => {
    const handleActivity = () => setLastActivity(Date.now());

    window.addEventListener("click", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("mousemove", handleActivity);

    return () => {
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("mousemove", handleActivity);
    };
  }, []);

  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    setLastActivity(Date.now());
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  // 🔁 Redirection automatique si déconnecté
  useEffect(() => {
    if (!token || !user) {
      navigate("/login");
    }
  }, [token, user]);

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
