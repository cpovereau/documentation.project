import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Desktop } from "./screens/Desktop/Desktop";
import { ProductDocSync } from "./screens/ProductDocSync/ProductDocSync";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/desktop" />} />
        <Route path="/desktop" element={<Desktop />} />
        <Route path="/product-doc-sync" element={<ProductDocSync />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
