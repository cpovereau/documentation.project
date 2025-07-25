import { useEffect } from "react";
import axios from "axios";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SessionExpiredModal from "@/components/ui/SessionExpiredModal";
import { useSessionStore } from "@/store/useSessionStore";
import { Desktop } from "./screens/Desktop/Desktop";
import SettingsScreen from "@/screens/Settings/SettingsScreen";
import { ProductDocSync } from "./screens/ProductDocSync/ProductDocSync";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Toaster } from "sonner";
import LoginScreen from "./screens/Login/LoginScreen";
import { useAuth } from "./contexts/AuthContext";

function App() {
  const { token } = useAuth();
  const { expired, setExpired } = useSessionStore();

  useEffect(() => {
    axios
      .get("http://localhost:8000/csrf/", {
        withCredentials: true, // 🔥 Nécessaire pour que le cookie soit posé
      })
      .then(() => {
        console.log("[CSRF] Token CSRF récupéré avec succès");
      })
      .catch((error) => {
        console.error("[CSRF] Échec récupération token CSRF :", error);
      });
  }, []);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          {!token ? (
            <>
              <Route path="/login" element={<LoginScreen />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Navigate to="/desktop" />} />
              <Route path="/settings" element={<SettingsScreen />} />
              <Route path="/desktop" element={<Desktop />} />
              <Route path="/product-doc-sync" element={<ProductDocSync />} />
              <Route path="*" element={<Navigate to="/desktop" />} />
            </>
          )}
        </Routes>
        <SessionExpiredModal open={expired} onClose={() => setExpired(false)} />
        <Toaster position="top-right" richColors closeButton />
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
