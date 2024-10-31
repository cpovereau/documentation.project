// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
// eslint-disable-next-line
import ErrorBoundary from './components/ErrorBoundary';
import ProjetList from './components/ProjetList';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/projets" element={<ProjetList />} />
          {/* Ajoutez d'autres routes pour modules et rubriques */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;