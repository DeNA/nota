import React, { useRef, useState } from "react";
import { imageSources, template } from "./dummy/template";

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

const EpipolarLine = function({
  width,
  height,
  mousePointer,
  equation,
  color
}) {
  const x1 = 0;
  const x2 = width;
  const y1 = Math.min(height, Math.max(0, equation.y(x1)));
  const y2 = Math.min(height, Math.max(0, equation.y(x2)));
  const closestPoint = mousePointer
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

const EpipolarImage = function({
  image,
  template,
  width,
  height,
  points,
  lines,
  pointCreate,
  onPointCreated,
  selectedPointId,
  onPointSelected,
  onPointUpdated
}) {
  const [movingPointer, setMovingPointer] = useState(null);
  const [isUpdatingPoint, setIsUpdatingPoint] = useState(false);
  const svgRef = useRef();
  const imageRef = useRef();

  const handleMouseMove = function(e) {
    const svgPoint = svgRef.current.createSVGPoint();
    svgPoint.x = e.clientX;
    svgPoint.y = e.clientY;

    const imagePosition = svgPoint.matrixTransform(
      imageRef.current.getScreenCTM().inverse()
    );

    setMovingPointer({
      x: Math.max(0, Math.min(imagePosition.x, width)),
      y: Math.max(0, Math.min(imagePosition.y, height))
    });
  };

  const handleMouseLeave = function(e) {
    setMovingPointer(null);
  };

  const handleMouseUp = function(e) {
    const svgPoint = svgRef.current.createSVGPoint();
    svgPoint.x = e.clientX;
    svgPoint.y = e.clientY;

    const imagePosition = svgPoint.matrixTransform(
      imageRef.current.getScreenCTM().inverse()
    );

    setMovingPointer(null);

    if (pointCreate) {
      onPointCreated(pointCreate, template, imagePosition);
    } else if (selectedPointId && isUpdatingPoint) {
      setIsUpdatingPoint(false);
      onPointUpdated(selectedPointId, imagePosition);
    }
  };
  const handlePointSelected = function(point) {
    onPointSelected(point.id);
    setIsUpdatingPoint(true);
  };

  const parsedPoints = points.map(point => {
    if (point.id === selectedPointId && isUpdatingPoint && movingPointer) {
      return { ...point, position: movingPointer };
    } else {
      return point;
    }
  });

  return (
    <svg
      width="100%"
      height="100%"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      ref={svgRef}
    >
      <defs />
      <g transform="scale(0.4)">
        <image x="0" y="0" xlinkHref={image} ref={imageRef} />
        {lines.map(line => (
          <EpipolarLine
            width={width}
            height={height}
            equation={line.equation}
            mousePointer={movingPointer}
            color={line.color}
          />
        ))}
        {parsedPoints.map(point => (
          <circle
            key={point.id}
            r={10}
            cx={point.position.x}
            cy={point.position.y}
            strokeWidth={5}
            stroke={point.color}
            fill="rgba(0,0,0,0)"
            onMouseDown={() => handlePointSelected(point)}
          />
        ))}
        {pointCreate && movingPointer && (
          <circle
            r={10}
            cx={movingPointer.x}
            cy={movingPointer.y}
            strokeWidth={5}
            stroke={pointCreate.color}
            fill="rgba(0,0,0,0)"
          />
        )}
      </g>
    </svg>
  );
};

const EpipolarAnnotation = function() {
  const {
    width,
    height,
    images,
    transformationMatrices,
    pointDefinitions
  } = template;
  const [points, setPoints] = useState([]);
  const [selectedPointId, setSelectedPointId] = useState(null);
  const [pointCreate, setPointCreate] = useState(null);
  const handlePointCreated = function(point, template, { x, y }) {
    setPointCreate(null);
    setPoints([
      ...points,
      { id: point.id, imageId: template.id, position: { x, y } }
    ]);
  };
  const handlePointSelected = function(pointId) {
    setSelectedPointId(pointId);
  };
  const handlePointUpdated = function(pointId, { x, y }) {
    const updatedPoints = points.map(point => {
      if (point.id === pointId) {
        return { ...point, position: { x, y } };
      } else {
        return point;
      }
    });
    setPoints(updatedPoints);
  };
  const handleCreatePointClick = function(point) {
    if (pointCreate && pointCreate.id === point.id) {
      setPointCreate(null);
    } else {
      setPointCreate(point);
      setSelectedPointId(null);
    }
  };
  const epipolarImages = images.map(template => {
    return {
      template,
      points: points
        .filter(point => point.imageId === template.id)
        .map(point => {
          const pointDefinition = pointDefinitions.find(
            pointDefinitions => pointDefinitions.id === point.id
          );

          return {
            ...point,
            color: pointDefinition.color
          };
        }),
      lines: points
        .filter(point => {
          const pointDefinition = pointDefinitions.find(
            pointDefinitions => pointDefinitions.id === point.id
          );
          return (
            point.imageId !== template.id &&
            pointDefinition.to.includes(template.id)
          );
        })
        .map(point => {
          const pointDefinition = pointDefinitions.find(
            pointDefinitions => pointDefinitions.id === point.id
          );

          return {
            color: pointDefinition.color,
            equation: getEpipolarLineEquations(
              point.position.x,
              point.position.y,
              transformationMatrices[`${point.imageId}_${template.id}`]
            )
          };
        })
    };
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <div>
        {pointDefinitions.map(pointDefinition => (
          <button
            type="button"
            style={{ backgroundColor: pointDefinition.color }}
            onClick={() => handleCreatePointClick(pointDefinition)}
          >
            {pointDefinition.id}
          </button>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          flex: 1,
          flexWrap: "wrap"
        }}
      >
        {epipolarImages.map(epipolarImage => (
          <div
            style={{
              flex: "1 0 50%"
            }}
          >
            <EpipolarImage
              key={epipolarImage.template.id}
              template={epipolarImage.template}
              image={imageSources[epipolarImage.template.id]}
              width={width}
              height={height}
              points={epipolarImage.points}
              lines={epipolarImage.lines}
              pointCreate={
                pointCreate?.from.includes(epipolarImage.template.id)
                  ? pointCreate
                  : null
              }
              onPointCreated={handlePointCreated}
              selectedPointId={selectedPointId}
              onPointSelected={handlePointSelected}
              onPointUpdated={handlePointUpdated}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default EpipolarAnnotation;
