import React from "react";

const EpipolarLine = function({
  width,
  height,
  mousePointer,
  equation,
  color,
  active
}) {
  const x1 = 0;
  const x2 = width;
  const y1 = Math.min(height, Math.max(0, equation.y(x1)));
  const y2 = Math.min(height, Math.max(0, equation.y(x2)));
  const closestPoint = mousePointer && active
    ? equation.closestPoint(mousePointer.x, mousePointer.y)
    : null;

  return (
    <g>
      <line
        strokeWidth={5}
        stroke={color}
        fill={color}
        x1={x1}
        x2={x2}
        y1={y1}
        y2={y2}
      />
      {closestPoint && (
        <circle
          r={10}
          cx={closestPoint.x}
          cy={closestPoint.y}
          strokeWidth={5}
          stroke={color}
          fill="rgba(0,0,0,0)"
        />
      )}
    </g>
  );
};

export default EpipolarLine;
