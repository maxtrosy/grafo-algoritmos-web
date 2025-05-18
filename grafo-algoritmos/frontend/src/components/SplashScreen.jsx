import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // Para navegación

const SplashScreen = () => {
  const [showButton, setShowButton] = useState(false);
  const navigate = useNavigate();

  // Muestra el botón después de 3 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 3000); // 3 segundos de animación
    return () => clearTimeout(timer);
  }, []);

  // Función para manejar el cambio de página
  const handleClick = () => {
    navigate('/home'); // Navega a la página 'home' cuando se hace clic en el botón
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white animate-fadeIn">
      <div className="text-center p-8 rounded-2xl bg-white bg-opacity-10 shadow-xl backdrop-blur-lg border border-white border-opacity-30 transform transition-all duration-1000 ease-out">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 animate__animated animate__fadeIn animate__delay-1s">
          Ilustración Didáctica de Algoritmos de Grafos
        </h1>
        <p className="text-lg md:text-xl mb-6 animate__animated animate__fadeIn animate__delay-2s">Trabajo Final IST4310-2266 - Mayo 2025</p>
        <div className="mb-4">
          <p className="text-sm md:text-base">Desarrollado por:</p>
          <p className="text-lg font-semibold">Maximiliano Torres</p>
        </div>
        <p className="italic mt-6 animate__animated animate__fadeIn animate__delay-3s">
          “La mujer virtuosa, ¿quién la hallará? Porque su estima sobrepasa largamente a la de las piedras preciosas.” – Pr. 31:10
        </p>
        {/* Mostrar botón después de 3 segundos */}
        {showButton && (
          <button
            onClick={handleClick}
            className="mt-6 px-8 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors duration-300"
          >
            Comenzar
          </button>
        )}
      </div>
    </div>
  );
};

export default SplashScreen;
