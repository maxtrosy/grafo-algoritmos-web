import React, { useState, useEffect, useCallback } from 'react';
import './Home.css';

const GraphVisualizer = () => {
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
  const [dijkstraData, setDijkstraData] = useState(null);
  const [primData, setPrimData] = useState(null);
  const [kruskalData, setKruskalData] = useState(null);

  const parseAdjacencyMatrix = useCallback((text) => {
    try {
      if (typeof text !== 'string') throw new Error('El input debe ser un texto');
      const lines = text.trim().split('\n').filter(line => line.trim().length > 0);
      if (lines.length === 0) throw new Error('El archivo está vacío');
      const firstLineParts = lines[0].trim().split(/\s+/).filter(Boolean);
      const hasLetterHeaders = /[A-Za-z]/.test(firstLineParts[0]);
      if (hasLetterHeaders) {
        const nodeLabels = firstLineParts.slice(0);
        const matrix = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].trim().split(/\s+/).filter(Boolean);
          if (values[0] !== nodeLabels[i - 1]) throw new Error(`Encabezado de fila no coincide: esperado ${nodeLabels[i - 1]}, obtenido ${values[0]}`);
          const rowValues = values.slice(1).map(val => {
            const num = Number(val);
            if (isNaN(num)) throw new Error(`Valor no numérico en fila ${i + 1}`);
            return num;
          });
          matrix.push(rowValues);
        }
        const n = matrix.length;
        if (n === 0 || !matrix.every(row => row.length === n)) throw new Error('La matriz de adyacencia debe ser cuadrada');
        return { matrix, nodeLabels };
      } else {
        const matrix = lines.map(line => line.trim().split(/\s+/).map(Number));
        const n = matrix.length;
        if (n === 0 || !matrix.every(row => row.length === n)) throw new Error('La matriz de adyacencia debe ser cuadrada');
        return { matrix, nodeLabels: Array.from({ length: n }, (_, i) => i.toString()) };
      }
    } catch (error) {
      setError(error.message);
      return null;
    }
  }, []);

  const handleFileUpload = useCallback((e) => {
    try {
      setError(null);
      const file = e.target.files[0];
      if (!file) return;
      if (!file.name.endsWith('.txt')) throw new Error('Solo se aceptan archivos .txt');

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target.result;
          if (typeof content !== 'string') throw new Error('Error al leer el contenido del archivo');
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
          setDijkstraData(null);
          setPrimData(null);
          setKruskalData(null);
        } catch (err) {
          setError(err.message);
        }
      };
      reader.onerror = () => { throw new Error('Error al leer el archivo'); };
      reader.readAsText(file);
    } catch (error) {
      setError(error.message);
    }
  }, [parseAdjacencyMatrix]);

  const calculateNodePositions = useCallback((nodeCount) => {
    try {
      if (!nodeCount || nodeCount <= 0) return;
      const containerSize = 600;
      const center = containerSize / 2;
      const radius = Math.min(200, 25 * nodeCount);
      const positions = [];
      for (let i = 0; i < nodeCount; i++) {
        const angle = (i * 2 * Math.PI) / nodeCount - Math.PI / 2;
        positions.push({ x: center + radius * Math.cos(angle), y: center + radius * Math.sin(angle) });
      }
      setNodePositions(positions);
    } catch (error) {
      setError('Error al calcular posiciones de nodos');
    }
  }, []);


  const API_BASE_URL = 'https://tu-backend-en-render.com';


  const handleRunAlgorithm = async () => {
    try {
      if (!matrix || matrix.length === 0) throw new Error('No hay matriz válida cargada');
      if (!selectedAlgorithm) throw new Error('Selecciona un algoritmo primero');
      if (startNode < 0 || startNode >= matrix.length) throw new Error(`Nodo inicial debe estar entre 0 y ${matrix.length - 1}`);
      setIsLoading(true);
      setError(null);
      setCurrentStep(0);
      setVisitedNodes([]);
      setExecutionHistory([]);
      setDijkstraData(null);
      setPrimData(null);
      setKruskalData(null);

      // Endpoint correcto
      const endpoint = `${API_BASE_URL}/run_${selectedAlgorithm}`;

      // Payload: si es prim o kruskal, no enviamos startNode porque no lo usan.
      const payload = { matrix };
      if (!['prim', 'kruskal'].includes(selectedAlgorithm)) {
        payload.start = startNode;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Procesar respuestas según algoritmo
      if (selectedAlgorithm === 'dijkstra' && data.distances && data.steps && data.paths) {
        setSteps(data.steps.map((nodeIndex, index) => `Paso ${index + 1}: Visitar nodo ${nodeLabels[nodeIndex] || nodeIndex}`));
        setVisitedNodes(data.steps);
        setExecutionHistory(data.steps.map((node, index) => ({
          step: index,
          currentNode: node,
          visitedNodes: data.steps.slice(0, index + 1)
        })));
        setDijkstraData({
          distances: data.distances,
          paths: data.paths
        });
      } else if ((selectedAlgorithm === 'prim' || selectedAlgorithm === 'kruskal') && data.mst && Array.isArray(data.mst)) {
        setSteps(
          data.mst.map(
            (edge, idx) =>
              `Paso ${idx + 1}: Agrega arista ${nodeLabels[edge.from] || edge.from} → ${nodeLabels[edge.to] || edge.to} (peso ${edge.weight})`
          )
        );
        if (selectedAlgorithm === 'prim') {
          setPrimData({
            mst: data.mst,
            totalWeight: data.totalWeight
          });
        } else {
          setKruskalData({
            mst: data.mst,
            totalWeight: data.totalWeight
          });
        }
      } else {
        // Para BFS, DFS u otros resultados
        const result = data.result || data.steps;
        if (!Array.isArray(result)) throw new Error('El resultado debe ser un array');
        setSteps(result.map((nodeIndex, index) => `Paso ${index + 1}: Visitar nodo ${nodeLabels[nodeIndex] || nodeIndex}`));
        setVisitedNodes(result);
        setExecutionHistory(result.map((node, index) => ({
          step: index,
          currentNode: node,
          visitedNodes: result.slice(0, index + 1)
        })));
      }
    } catch (error) {
      setError(error.message);
      console.error('Error en handleRunAlgorithm:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = () => { if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1); };
  const handlePrevStep = () => { if (currentStep > 0) setCurrentStep(currentStep - 1); };
  const jumpToStep = (stepIndex) => { if (stepIndex >= 0 && stepIndex < steps.length) setCurrentStep(stepIndex); };
  const getCurrentNode = () => (visitedNodes.length === 0 || currentStep >= visitedNodes.length) ? null : visitedNodes[currentStep];

  useEffect(() => {
    setSteps([]);
    setCurrentStep(0);
    setVisitedNodes([]);
    setExecutionHistory([]);
    setDijkstraData(null);
    setPrimData(null);
    setKruskalData(null);
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

              {nodePositions.map((pos, i) => {
                const isCurrentNode = getCurrentNode() === i;
                const wasVisited = visitedNodes.slice(0, currentStep).includes(i);

                let fillColor;
                if (isCurrentNode) fillColor = "#ff5722";
                else if (wasVisited) fillColor = "#4caf50";
                else fillColor = "#0071e3";

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
          <div className="current-node-display">
            {getCurrentNode() !== null && (
              <p>Nodo actual: <strong>{nodeLabels[getCurrentNode()] || getCurrentNode()}</strong></p>
            )}
          </div>
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
                    if (selectedAlgorithm === 'prim' || selectedAlgorithm === 'kruskal') {
                      return step.split(':')[1].trim().split('(')[0];
                    } else {
                      const node = step.split(':')[1].trim().split(' ')[2];
                      return node;
                    }
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

      {/* --- Tabla de Dijkstra como div independiente, SIEMPRE DEBAJO --- */}
      {selectedAlgorithm === 'dijkstra' && dijkstraData && (
        <div className="dijkstra-table-section" style={{
          marginTop: '36px',
          background: '#1a1a1a',
          borderRadius: '10px',
          padding: '24px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
        }}>
          <h3>Tabla de Dijkstra</h3>
          <table className="dijkstra-table">
            <thead>
              <tr>
                <th>Nodo</th>
                <th>Distancia mínima</th>
                <th>Camino más corto</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(dijkstraData.distances).map((node) => (
                <tr key={node}>
                  <td>{nodeLabels[node] || node}</td>
                  <td>
                    {dijkstraData.distances[node] === Infinity
                      ? '∞'
                      : dijkstraData.distances[node]}
                  </td>
                  <td>
                    {dijkstraData.paths[node] && dijkstraData.paths[node].length > 0
                      ? dijkstraData.paths[node].map(p => nodeLabels[p] || p).join(' → ')
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- Tabla de Prim como div independiente, SIEMPRE DEBAJO --- */}
      {selectedAlgorithm === 'prim' && primData && (
        <div className="prim-table-section" style={{
          marginTop: '36px',
          background: '#1a1a1a',
          borderRadius: '10px',
          padding: '24px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
        }}>
          <h3>Árbol de Expansión Mínima (Prim)</h3>
          <table className="prim-table">
            <thead>
              <tr>
                <th>Desde</th>
                <th>Hasta</th>
                <th>Peso</th>
              </tr>
            </thead>
            <tbody>
              {primData.mst.map((edge, idx) => (
                <tr key={idx}>
                  <td>{nodeLabels[edge.from] || edge.from}</td>
                  <td>{nodeLabels[edge.to] || edge.to}</td>
                  <td>{edge.weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ color: '#4caf50', fontWeight: 'bold', marginTop: '16px', fontSize: '1.2rem' }}>
            Peso total del árbol: {primData.totalWeight}
          </div>
        </div>
      )}

      {/* --- Tabla de Kruskal como div independiente, SIEMPRE DEBAJO --- */}
      {selectedAlgorithm === 'kruskal' && kruskalData && (
        <div className="kruskal-table-section" style={{
          marginTop: '36px',
          background: '#1a1a1a',
          borderRadius: '10px',
          padding: '24px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
        }}>
          <h3>Árbol de Expansión Mínima (Kruskal)</h3>
          <table className="kruskal-table">
            <thead>
              <tr>
                <th>Desde</th>
                <th>Hasta</th>
                <th>Peso</th>
              </tr>
            </thead>
            <tbody>
              {kruskalData.mst.map((edge, idx) => (
                <tr key={idx}>
                  <td>{nodeLabels[edge.from] || edge.from}</td>
                  <td>{nodeLabels[edge.to] || edge.to}</td>
                  <td>{edge.weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ color: '#4caf50', fontWeight: 'bold', marginTop: '16px', fontSize: '1.2rem' }}>
            Peso total del árbol: {kruskalData.totalWeight}
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphVisualizer;
