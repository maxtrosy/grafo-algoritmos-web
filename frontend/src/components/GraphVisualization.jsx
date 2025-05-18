// GraphCanvas.jsx
import React from 'react';

const GraphCanvas = ({ matrix, nodePositions }) => {
  if (!matrix || nodePositions.length === 0) return null;

  return (
    <svg width="600" height="600" viewBox="0 0 600 600">
      {/* Aristas */}
      {matrix.map((row, i) =>
        row.map((weight, j) => {
          if (weight > 0 && i <= j) {
            return (
              <line
                key={`edge-${i}-${j}`}
                x1={nodePositions[i].x}
                y1={nodePositions[i].y}
                x2={nodePositions[j].x}
                y2={nodePositions[j].y}
                stroke="#42a1ec"
                strokeWidth={Math.min(weight * 1.5, 5)}
                strokeOpacity="0.7"
              />
            );
          }
          return null;
        })
      )}

      {/* Nodos */}
      {nodePositions.map((pos, i) => (
        <g key={`node-${i}`}>
          <circle
            cx={pos.x}
            cy={pos.y}
            r="20"
            fill="#0071e3"
            stroke="#42a1ec"
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
            {i + 1}
          </text>
        </g>
      ))}
    </svg>
  );
};

export default GraphCanvas;
