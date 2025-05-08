import React, { useState } from 'react';

const AlgorithmSelector = ({ onAlgorithmSelect, onGraphDataChange }) => {
  const [graphInput, setGraphInput] = useState('');

  const handleAlgorithmChange = (e) => {
    onAlgorithmSelect(e.target.value);
  };

  const handleGraphInputChange = (e) => {
    setGraphInput(e.target.value);
    onGraphDataChange(e.target.value);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <select
        onChange={handleAlgorithmChange}
        className="p-2 text-black rounded-md shadow-md w-64"
      >
        <option value="">Selecciona un Algoritmo</option>
        <option value="bfs">BFS</option>
        <option value="dfs">DFS</option>
        <option value="dijkstra">Dijkstra</option>
        <option value="prim">Prim</option>
        <option value="kruskal">Kruskal</option>
      </select>

      <textarea
        placeholder="Introduce la lista o matriz de adyacencia"
        value={graphInput}
        onChange={handleGraphInputChange}
        className="p-2 text-black rounded-md shadow-md w-64 h-40"
      />

      <button
        onClick={() => alert("Grafo cargado y algoritmo ejecutado")}
        className="p-2 bg-blue-500 rounded-md text-white hover:bg-blue-700 transition duration-200"
      >
        Ejecutar
      </button>
    </div>
  );
};

export default AlgorithmSelector;
