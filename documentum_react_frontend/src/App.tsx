import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Desktop } from "./screens/Desktop/Desktop";
import { ProductDocSync } from "./screens/ProductDocSync/ProductDocSync";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Toaster } from "sonner";

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Navigate to="/desktop" />} />
          <Route path="/desktop" element={<Desktop />} />
          <Route path="/product-doc-sync" element={<ProductDocSync />} />
        </Routes>
        <Toaster position="top-right" richColors closeButton />
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
