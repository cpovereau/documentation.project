import { useEffect } from "react";
import axios from "axios";
import { Routes, Route, Navigate } from "react-router-dom";
import SessionExpiredModal from "@/components/ui/SessionExpiredModal";
import { RequireAuth } from "@/components/RequireAuth";
import { useSessionStore } from "@/store/useSessionStore";
import { Desktop } from "./screens/Desktop/Desktop";
import SettingsScreen from "@/screens/Settings/SettingsScreen";
import { ProductDocSync } from "./screens/ProductDocSync/ProductDocSync";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Toaster } from "sonner";
import LoginScreen from "./screens/Login/LoginScreen";

function App() {
  const { expired, setExpired } = useSessionStore();

  useEffect(() => {
    axios
      .get("http://localhost:8000/csrf/", {
        withCredentials: true,
      })
      .then(() => {
        console.log("[CSRF] Token CSRF récupéré avec succès");
      })
      .catch((error) => {
        console.error("[CSRF] Échec récupération token CSRF :", error);
      });
  }, []);

  return (
    <ErrorBoundary>
      <Routes>
        {/* ✅ Route publique */}
        <Route path="/login" element={<LoginScreen />} />

        {/* ✅ Routes protégées */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <Navigate to="/desktop" />
            </RequireAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <SettingsScreen />
            </RequireAuth>
          }
        />
        <Route
          path="/desktop"
          element={
            <RequireAuth>
              <Desktop />
            </RequireAuth>
          }
        />
        <Route
          path="/product-doc-sync"
          element={
            <RequireAuth>
              <ProductDocSync />
            </RequireAuth>
          }
        />

        {/* ✅ Catch-all redirigé */}
        <Route
          path="*"
          element={
            <RequireAuth>
              <Navigate to="/desktop" />
            </RequireAuth>
          }
        />
      </Routes>

      <SessionExpiredModal open={expired} onClose={() => setExpired(false)} />
      <Toaster position="top-right" richColors closeButton />
    </ErrorBoundary>
  );
}

export default App;
