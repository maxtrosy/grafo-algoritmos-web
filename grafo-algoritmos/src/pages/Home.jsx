import React, { useState, useEffect, useCallback } from 'react';
import './Home.css';

const GraphVisualizer = () => {
  // State management
  const [graphInput, setGraphInput] = useState('');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('');
  const [steps, setSteps] = useState([]);
  const [matrix, setMatrix] = useState([]);
  const [nodePositions, setNodePositions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startNode, setStartNode] = useState(0);

  // Parse adjacency matrix with enhanced validation
  const parseAdjacencyMatrix = useCallback((text) => {
    try {
      if (typeof text !== 'string') {
        throw new Error('El input debe ser un texto');
      }

      const lines = text
        .trim()
        .split('\n')
        .filter(line => line.trim().length > 0);
      
      if (lines.length === 0) {
        throw new Error('El archivo está vacío');
      }

      const matrix = lines.map((line, i) => {
        const values = line.trim().split(/\s+/);
        return values.map((val, j) => {
          const num = Number(val);
          if (isNaN(num)) {
            throw new Error(`Valor no numérico en fila ${i+1}, columna ${j+1}: ${val}`);
          }
          return num;
        });
      });
      
      // Validate square matrix
      const n = matrix.length;
      if (!matrix.every(row => row.length === n)) {
        throw new Error('La matriz de adyacencia debe ser cuadrada');
      }

      return matrix;
    } catch (error) {
      setError(error.message);
      return null;
    }
  }, []);

  // Handle file upload with robust error handling
  const handleFileUpload = useCallback((e) => {
    try {
      setError(null);
      const file = e.target.files[0];
      
      if (!file) return;
      
      if (!file.name.endsWith('.txt')) {
        throw new Error('Solo se aceptan archivos .txt');
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target.result;
          if (typeof content !== 'string') {
            throw new Error('Error al leer el contenido del archivo');
          }

          const parsedMatrix = parseAdjacencyMatrix(content);
          if (!parsedMatrix) return;

          setGraphInput(content);
          setMatrix(parsedMatrix);
          calculateNodePositions(parsedMatrix.length);
          setSteps([]);
        } catch (err) {
          setError(err.message);
        }
      };
      
      reader.onerror = () => {
        throw new Error('Error al leer el archivo');
      };
      
      reader.readAsText(file);
    } catch (error) {
      setError(error.message);
    }
  }, [parseAdjacencyMatrix]);

  // Calculate node positions with circular layout
  const calculateNodePositions = useCallback((nodeCount) => {
    try {
      if (!nodeCount || nodeCount <= 0) return;

      const containerSize = 600;
      const center = containerSize / 2;
      const radius = Math.min(200, 25 * nodeCount);
      const positions = [];
      
      for (let i = 0; i < nodeCount; i++) {
        const angle = (i * 2 * Math.PI) / nodeCount - Math.PI / 2;
        positions.push({
          x: center + radius * Math.cos(angle),
          y: center + radius * Math.sin(angle)
        });
      }
      
      setNodePositions(positions);
    } catch (error) {
      setError('Error al calcular posiciones de nodos');
    }
  }, []);

  // Run algorithm with comprehensive error handling
  const handleRunAlgorithm = async () => {
    try {
      // Validate inputs
      if (!matrix || matrix.length === 0) {
        throw new Error('No hay matriz válida cargada');
      }

      if (!selectedAlgorithm) {
        throw new Error('Selecciona un algoritmo primero');
      }

      if (startNode < 0 || startNode >= matrix.length) {
        throw new Error(`Nodo inicial debe estar entre 0 y ${matrix.length - 1}`);
      }

      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:5000/run_${selectedAlgorithm}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matrix: matrix,
          start: startNode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Validate and format response
      if (!data.result && !data.steps) {
        throw new Error('Formato de respuesta inválido del servidor');
      }

      const result = data.result || data.steps;
      if (!Array.isArray(result)) {
        throw new Error('El resultado debe ser un array');
      }

      // Format steps for display
      const formattedSteps = result.map((node, index) => 
        `Paso ${index + 1}: Visitar nodo ${node}`
      );
      
      setSteps(formattedSteps);
    } catch (error) {
      setError(error.message);
      console.error('Error en handleRunAlgorithm:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset steps when matrix changes
  useEffect(() => {
    setSteps([]);
  }, [matrix]);

  // Render the component
  return (
    <div className="main-content">
      <h2>Visualizador de Algoritmos de Grafos</h2>

      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={() => setError(null)}>Cerrar</button>
        </div>
      )}

      <div className="form-section">
        <div className="file-upload-box">
          <label htmlFor="file" className="file-label">
            Cargar archivo de grafo (.txt):
          </label>
          <input
            type="file"
            id="file"
            accept=".txt"
            onChange={handleFileUpload}
            className="file-input"
            disabled={isLoading}
          />
        </div>

        <div className="algorithm-controls">
          <div className="select-algorithm">
            <label htmlFor="algorithm">Algoritmo:</label>
            <select
              id="algorithm"
              value={selectedAlgorithm}
              onChange={(e) => setSelectedAlgorithm(e.target.value)}
              className="algorithm-select"
              disabled={isLoading || matrix.length === 0}
            >
              <option value="">-- Selecciona --</option>
              <option value="bfs">BFS (Búsqueda en Anchura)</option>
              <option value="dfs">DFS (Búsqueda en Profundidad)</option>
              <option value="dijkstra">Dijkstra</option>
              <option value="prim">Prim</option>
              <option value="kruskal">Kruskal</option>
            </select>
          </div>

          {matrix.length > 0 && (
            <div className="start-node-selector">
              <label htmlFor="startNode">Nodo inicial:</label>
              <input
                type="number"
                id="startNode"
                min="0"
                max={matrix.length - 1}
                value={startNode}
                onChange={(e) => setStartNode(Math.min(Math.max(0, parseInt(e.target.value) || 0), matrix.length - 1))}
                disabled={isLoading}
              />
            </div>
          )}
        </div>

        <button 
          className={`run-button ${isLoading ? 'loading' : ''}`}
          onClick={handleRunAlgorithm}
          disabled={isLoading || matrix.length === 0 || !selectedAlgorithm}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Procesando...
            </>
          ) : (
            'Ejecutar Algoritmo'
          )}
        </button>
      </div>

      {matrix.length > 0 && (
        <div className="visualization-section">
          <div className="visualization-container">
            <h3>Visualización del Grafo</h3>
            <div className="graph-visualization">
              <svg width="600" height="600" viewBox="0 0 600 600">
                {/* Render edges */}
                {matrix.map((row, i) => 
                  row.slice(i + 1).map((weight, j) => {
                    const actualJ = i + 1 + j;
                    if (weight > 0 && nodePositions[i] && nodePositions[actualJ]) {
                      return (
                        <line 
                          key={`edge-${i}-${actualJ}`}
                          x1={nodePositions[i].x}
                          y1={nodePositions[i].y}
                          x2={nodePositions[actualJ].x}
                          y2={nodePositions[actualJ].y}
                          stroke="#42a1ec"
                          strokeWidth={Math.min(weight * 0.5 + 1, 5)}
                          strokeOpacity="0.7"
                        />
                      );
                    }
                    return null;
                  })
                ).flat().filter(Boolean)}
                
                {/* Render nodes */}
                {nodePositions.map((pos, i) => (
                  <g key={`node-${i}`}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="20"
                      fill={steps.some(step => step.includes(`nodo ${i}`)) ? "#ff5722" : "#0071e3"}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x={pos.x}
                      y={pos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="14"
                      fontWeight="bold"
                    >
                      {i}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          <div className="matrix-display">
            <h3>Matriz de Adyacencia</h3>
            <div className="matrix-container">
              <table>
                <tbody>
                  {matrix.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td 
                          key={j} 
                          className={cell > 0 ? 'connected' : ''}
                          data-start={i === startNode || j === startNode}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {steps.length > 0 && (
        <div className="results-section">
          <h3>Resultados del {selectedAlgorithm.toUpperCase()}</h3>
          <div className="algorithm-steps">
            <h4>Orden de visita:</h4>
            <div className="visit-order">
              {steps.map(step => step.match(/\d+$/)[0]).join(' → ')}
            </div>
            <h4>Detalle de pasos:</h4>
            <ol className="steps-list">
              {steps.map((step, idx) => (
                <li key={idx}>
                  <span className="step-number">{idx + 1}.</span>
                  <span className="step-description">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphVisualizer;