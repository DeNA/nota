import React from "react";

const EpipolarLine = function({
  width,
  height,
  equation,
  color,
  active,
  linePoint
}) {
  const x1 = 0;
  const x2 = width;
  const y1 = Math.min(height, Math.max(0, equation.y(x1)));
  const y2 = Math.min(height, Math.max(0, equation.y(x2)));

  return (
    <g>
      <line
        strokeWidth={5}
        stroke={color}
        style={{
          opacity: active ? 1 : 0.1
        }}
        fill={color}
        x1={x1}
        x2={x2}
        y1={y1}
        y2={y2}
      />
      {linePoint && (
        <circle
          r={10}
          cx={linePoint.x}
          cy={linePoint.y}
          strokeWidth={5}
          stroke={color}
          fill="rgba(0,0,0,0)"
        />
      )}
    </g>
  );
};

export default EpipolarLine;
