import React, { useEffect } from 'react';
import cytoscape from 'cytoscape';

const GraphVisualizer = ({ algorithm, graphData }) => {
  useEffect(() => {
    if (graphData) {
      const cy = cytoscape({
        container: document.getElementById('cy'), // Contenedor de Cytoscape
        elements: JSON.parse(graphData), // Los datos del grafo en formato JSON
        style: [
          {
            selector: 'node',
            style: {
              'background-color': '#0078D4',
              'label': 'data(id)',
              'color': '#fff',
              'text-valign': 'center',
              'text-halign': 'center',
            },
          },
          {
            selector: 'edge',
            style: {
              'width': 2,
              'line-color': '#ccc',
            },
          },
        ],
        layout: {
          name: 'grid',
          rows: 1,
        },
      });
    }
  }, [graphData]);

  return (
    <div className="w-full h-96 mt-8">
      <div id="cy" className="w-full h-full"></div>
    </div>
  );
};

export default GraphVisualizer;
