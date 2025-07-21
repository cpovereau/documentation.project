import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Desktop } from "./screens/Desktop/Desktop";
import SettingsScreen from "@/screens/Settings/SettingsScreen";
import { ProductDocSync } from "./screens/ProductDocSync/ProductDocSync";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Toaster } from "sonner";
import LoginScreen from "./screens/Login/LoginScreen";
import { useAuth } from "./contexts/AuthContext";

function App() {
  const { token } = useAuth();

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
        <Toaster position="top-right" richColors closeButton />
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
