import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Desktop } from "./screens/Desktop/Desktop";
import { ProductDocSync } from "./screens/ProductDocSync/ProductDocSync";
import { Toaster } from "sonner";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/desktop" />} />
        <Route path="/desktop" element={<Desktop />} />
        <Route path="/product-doc-sync" element={<ProductDocSync />} />
      </Routes>
      <Toaster position="top-right" richColors closeButton />
    </BrowserRouter>
  );
}

export default App;
