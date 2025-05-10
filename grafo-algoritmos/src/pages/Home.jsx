import React, { useState, useEffect, useCallback } from 'react';
import './Home.css';

const GraphVisualizer = () => {
  // State management
  const [graphInput, setGraphInput] = useState('');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('');
  const [steps, setSteps] = useState([]);
  const [matrix, setMatrix] = useState([]);
  const [nodePositions, setNodePositions] = useState([]);
  const [nodeLabels, setNodeLabels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startNode, setStartNode] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [executionHistory, setExecutionHistory] = useState([]);

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

      // Check if first line contains letters (header row)
      const firstLineParts = lines[0].trim().split(/\s+/).filter(Boolean);
      const hasLetterHeaders = /[A-Za-z]/.test(firstLineParts[0]);

      if (hasLetterHeaders) {
        // Parse matrix with letter headers
        const nodeLabels = firstLineParts.slice(0);
        const matrix = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].trim().split(/\s+/).filter(Boolean);
          const rowLabel = values[0];

          if (rowLabel !== nodeLabels[i - 1]) {
            throw new Error(`Encabezado de fila no coincide: esperado ${nodeLabels[i - 1]}, obtenido ${rowLabel}`);
          }

          const rowValues = values.slice(1).map((val, j) => {
            const num = Number(val);
            if (isNaN(num)) {
              throw new Error(`Valor no numérico en fila ${i + 1}, columna ${j + 1}: ${val}`);
            }
            return num;
          });

          matrix.push(rowValues);
        }

        const n = matrix.length;
        if (n === 0 || !matrix.every(row => row.length === n)) {
          throw new Error('La matriz de adyacencia debe ser cuadrada');
        }

        return { matrix, nodeLabels };
      } else {
        // Parse simple numeric matrix
        const matrix = lines.map((line, i) => {
          const values = line.trim().split(/\s+/).filter(Boolean);
          return values.map((val, j) => {
            const num = Number(val);
            if (isNaN(num)) {
              throw new Error(`Valor no numérico en fila ${i + 1}, columna ${j + 1}: ${val}`);
            }
            return num;
          });
        });

        const n = matrix.length;
        if (n === 0 || !matrix.every(row => row.length === n)) {
          throw new Error('La matriz de adyacencia debe ser cuadrada');
        }

        return { matrix, nodeLabels: Array.from({ length: n }, (_, i) => i.toString()) };
      }
    } catch (error) {
      setError(error.message);
      return null;
    }
  }, []);

  // Handle file upload
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

          const parsedData = parseAdjacencyMatrix(content);
          if (!parsedData) return;

          setGraphInput(content);
          setMatrix(parsedData.matrix);
          setNodeLabels(parsedData.nodeLabels);
          calculateNodePositions(parsedData.matrix.length);
          setSteps([]);
          setCurrentStep(0);
          setVisitedNodes([]);
          setExecutionHistory([]);
          setStartNode(0);
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

  // Calculate node positions
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

  // Run algorithm
  const handleRunAlgorithm = async () => {
    try {
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
      setCurrentStep(0);
      setVisitedNodes([]);
      setExecutionHistory([]);

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
      
      if (!data.result && !data.steps) {
        throw new Error('Formato de respuesta inválido del servidor');
      }

      const result = data.result || data.steps;
      if (!Array.isArray(result)) {
        throw new Error('El resultado debe ser un array');
      }

      const formattedSteps = result.map((nodeIndex, index) =>
        `Paso ${index + 1}: Visitar nodo ${nodeLabels[nodeIndex] || nodeIndex}`
      );

      setSteps(formattedSteps);
      setVisitedNodes(result);
      setExecutionHistory(result.map((node, index) => ({
        step: index,
        currentNode: node,
        visitedNodes: result.slice(0, index + 1)
      })));
    } catch (error) {
      setError(error.message);
      console.error('Error en handleRunAlgorithm:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation functions
  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const jumpToStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  };

  // Get current node information
  const getCurrentNode = () => {
    if (visitedNodes.length === 0 || currentStep >= visitedNodes.length) return null;
    return visitedNodes[currentStep];
  };

  // Reset when matrix changes
  useEffect(() => {
    setSteps([]);
    setCurrentStep(0);
    setVisitedNodes([]);
    setExecutionHistory([]);
  }, [matrix]);

  return (
    <div className="graph-visualizer-app">
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
              <select
                id="startNode"
                value={startNode}
                onChange={(e) => setStartNode(parseInt(e.target.value))}
                disabled={isLoading}
              >
                {nodeLabels.map((label, index) => (
                  <option key={index} value={index}>
                    {label} (Nodo {index})
                  </option>
                ))}
              </select>
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

      <div className="visualization-container">
        <div className="graph-section">
          <h3>Visualización del Grafo</h3>
          <div className="graph-visualization">
            <svg width="100%" height="400" viewBox="0 0 600 600">
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

              {/* Render nodes with dynamic coloring */}
              {nodePositions.map((pos, i) => {
                const isCurrentNode = getCurrentNode() === i;
                const wasVisited = visitedNodes.slice(0, currentStep).includes(i);
                
                let fillColor;
                if (isCurrentNode) {
                  fillColor = "#ff5722"; // Current node - orange
                } else if (wasVisited) {
                  fillColor = "#4caf50"; // Visited nodes - green
                } else {
                  fillColor = "#0071e3"; // Unvisited nodes - blue
                }

                return (
                  <g key={`node-${i}`}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="20"
                      fill={fillColor}
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
                      {nodeLabels[i] || i}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          {/* Current node display */}
          <div className="current-node-display">
            {getCurrentNode() !== null && (
              <p>Nodo actual: <strong>{nodeLabels[getCurrentNode()] || getCurrentNode()}</strong></p>
            )}
          </div>
          {/* Step navigation controls */}
          {steps.length > 0 && (
            <div className="step-navigation">
              <button 
                onClick={handlePrevStep}
                disabled={currentStep === 0 || isLoading}
                className="nav-button prev-button"
              >
                Anterior
              </button>
              <input
                type="range"
                min="0"
                max={steps.length - 1}
                value={currentStep}
                onChange={(e) => jumpToStep(parseInt(e.target.value))}
                className="step-slider"
              />
              <button 
                onClick={handleNextStep}
                disabled={currentStep === steps.length - 1 || isLoading}
                className="nav-button next-button"
              >
                Siguiente
              </button>
              <span className="step-counter">
                Paso {currentStep + 1} de {steps.length}
              </span>
            </div>
          )}
        </div>

        <div className="matrix-section">
          <h3>Matriz de Adyacencia</h3>
          <div className="matrix-display">
            <table>
              <thead>
                <tr>
                  <th></th>
                  {nodeLabels.map((label, index) => (
                    <th key={index}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row, i) => (
                  <tr key={i}>
                    <td><strong>{nodeLabels[i]}</strong></td>
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className={cell > 0 ? 'connected' : ''}
                        data-start={i === startNode || j === startNode}
                        data-current={getCurrentNode() === i || getCurrentNode() === j}
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

        <div className="results-section">
          {steps.length > 0 && (
            <>
              <h3>Resultados del {selectedAlgorithm.toUpperCase()}</h3>
              
              <div className="algorithm-steps">
                <h4>Orden de visita:</h4>
                <div className="visit-order">
                  {steps.slice(0, currentStep + 1).map(step => {
                    const node = step.split(':')[1].trim().split(' ')[2];
                    return node;
                  }).join(' → ')}
                </div>
                <h4>Detalle de pasos:</h4>
                <ol className="steps-list">
                  {steps.map((step, idx) => (
                    <li 
                      key={idx}
                      className={idx === currentStep ? 'active-step' : ''}
                      onClick={() => jumpToStep(idx)}
                    >
                      <span className="step-number">{idx + 1}.</span>
                      <span className="step-description">{step}</span>
                      
                    </li>

                    
                  ))}
                </ol>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GraphVisualizer;