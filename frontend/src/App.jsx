import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './app.css';
import Home from './pages/Home';

// Componente SplashScreen
const SplashScreen = ({ onFinish }) => {
  return (
    <div className="splash-screen">
      <div className="splash-content">
        <h1>Algoritmos de Grafos</h1>
        <p>Una presentación interactiva de los algoritmos fundamentales utilizados en la teoría de grafos. Desarrollado para brindar una experiencia moderna e interactiva.</p>
        <div className="identifications">
          <p>Desarrollado por:</p>
          <p>Integrante 1: Zahir Acosta De La Asunción</p>
          <p>Integrante 2: María Isabel Gutiérrez Gonzalez</p>
        </div>
        <button onClick={onFinish}>Iniciar</button>
      </div>
    </div>
  );
};

// Componente principal de contenido después del Splash
const MainContent = () => {
  const navigate = useNavigate();

  return (
    <div className="main-content">
      <h2>Bienvenido a la Aplicación de Algoritmos de Grafos</h2>
      <button onClick={() => navigate('/home')}>Ir a la página siguiente</button>
    </div>
  );
};

// Componente principal App con rutas
const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  return (
    <Router>
      <Routes>
        {showSplash ? (
          <Route path="*" element={<SplashScreen onFinish={handleSplashFinish} />} />
        ) : (
          <>
            <Route path="/" element={<MainContent />} />
            <Route path="/home" element={<Home />} />
          </>
        )}
      </Routes>
    </Router>
  );
};

export default App;
