import React, { useState } from 'react';
import './App.css';

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

// Componente principal de la aplicación
const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => {
    setShowSplash(false); // Oculta el Splash Screen
  };

  return (
    <div>
      {showSplash ? (
        <SplashScreen onFinish={handleSplashFinish} />
      ) : (
        <div className="main-content">
          <h2>Bienvenido a la Aplicación de Algoritmos de Grafos</h2>
          <button onClick={() => alert('Navegar a la siguiente página')}>
            Ir a la página siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
