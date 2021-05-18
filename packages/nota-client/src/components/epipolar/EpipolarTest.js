import React, { useEffect, useRef, useState } from "react";
import { h11h12, h11h31, h11h32 } from "./dummy/calibration";
import h11 from "./dummy/h11.jpg";
import h12 from "./dummy/h12.jpg";
import h31 from "./dummy/h31.jpg";
import h32 from "./dummy/h32.jpg";

const getEpipolarLineEquations = function(x, y, f) {
  const a = f[0][0] * x + f[0][1] * y + f[0][2];
  const b = f[1][0] * x + f[1][1] * y + f[1][2];
  const c = f[2][0] * x + f[2][1] * y + f[2][2];

  // ax+by+c=0
  // x=-((by+c)/a)
  // y=-((ax+c)/b)
  return {
    x: y => -((b * y + c) / a),
    y: x => -((a * x + c) / b),
    closestPoint: (x, y) => ({
      x: (b * (b * x - a * y) - a * c) / (a * a + b * b),
      y: (a * (-b * x + a * y) - b * c) / (a * a + b * b)
    })
  };
};

const width = 1920;
const height = 1080;

const EpipolarImage = function({ image, equation, width, height }) {
  const [movingPoint, setMovingPoint] = useState(null);
  const imageRef = useRef();
  const handleMouseMove = function(e) {
    const svgPoint = e.currentTarget.createSVGPoint();
    svgPoint.x = e.clientX;
    svgPoint.y = e.clientY;

    const imagePosition = svgPoint.matrixTransform(
      imageRef.current.getScreenCTM().inverse()
    );

    setMovingPoint({
      x: Math.max(0, Math.min(imagePosition.x, width)),
      y: Math.max(0, Math.min(imagePosition.y, height))
    });
  };

  const x1 = 0;
  const x2 = width;
  const y1 = equation.y(x1);
  const y2 = equation.y(x2);
  const closestPoint = movingPoint
    ? equation.closestPoint(movingPoint.x, movingPoint.y)
    : null;

  return (
    <svg width="100%" height="100%" onMouseMove={handleMouseMove}>
      <defs>
        <clipPath id="clip-image">
          <rect x="0" y="0" width={width} height={height} />
        </clipPath>
      </defs>
      <g transform="scale(0.3)" clipPath="url(#clip-image)">
        <image x="0" y="0" xlinkHref={image} ref={imageRef} />
        <line
          strokeWidth={2}
          stroke="red"
          fill="red"
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
            stroke="red"
            fill="rgba(0,0,0,0)"
          />
        )}
      </g>
    </svg>
  );
};

const EpipolarTest = function() {
  const [[h11X, h11Y], setPoint] = useState([923, 594]);
  const [isMoving, setIsMoving] = useState(false);
  const svgRef = useRef();
  const imageRef = useRef();
  const fh12 = getEpipolarLineEquations(h11X, h11Y, h11h12);
  const fh31 = getEpipolarLineEquations(h11X, h11Y, h11h31);
  const fh32 = getEpipolarLineEquations(h11X, h11Y, h11h32);

  const handleMouseDown = function(e) {
    setIsMoving(true);
  };

  useEffect(() => {
    const handleMouseMove = function(e) {
      if (!isMoving) {
        return;
      }
      const svgPoint = svgRef.current.createSVGPoint();
      svgPoint.x = e.clientX;
      svgPoint.y = e.clientY;

      const imagePosition = svgPoint.matrixTransform(
        imageRef.current.getScreenCTM().inverse()
      );

      setPoint([
        Math.max(0, Math.min(imagePosition.x, width)),
        Math.max(0, Math.min(imagePosition.y, height))
      ]);
    };

    const handleMouseUp = function(e) {
      setIsMoving(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isMoving, setIsMoving]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div style={{ width: "100%", height: "50%", display: "flex" }}>
        <div style={{ width: "50%", height: "100%" }}>
          <svg width="100%" height="100%" ref={svgRef}>
            <g transform="scale(0.3)">
              <image x="0" y="0" xlinkHref={h11} ref={imageRef} />
              <circle
                r={10}
                cx={h11X}
                cy={h11Y}
                strokeWidth={5}
                stroke="red"
                fill="rgba(0,0,0,0)"
                onMouseDown={handleMouseDown}
              />
            </g>
          </svg>
        </div>
        <div style={{ width: "50%", height: "100%" }}>
          <EpipolarImage
            image={h12}
            height={height}
            width={width}
            equation={fh12}
          />
        </div>
      </div>
      <div style={{ width: "100%", height: "50%", display: "flex" }}>
        <div style={{ width: "50%", height: "100%" }}>
          <EpipolarImage
            image={h31}
            height={height}
            width={width}
            equation={fh31}
          />
        </div>
        <div style={{ width: "50%", height: "100%" }}>
          <EpipolarImage
            image={h32}
            height={height}
            width={width}
            equation={fh32}
          />
        </div>
      </div>
    </div>
  );
};

export default EpipolarTest;
