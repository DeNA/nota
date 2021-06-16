import React, { useEffect, useRef, useState } from "react";
import EpipolarLine from "./EpipolarLine";
import { cropImageToDataString } from "../../lib/image";

const EpipolarImage = function({
  imageUri,
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
  const [image, setImage] = useState(null);
  const [movingPointer, setMovingPointer] = useState(null);
  const [lineMagnet, setLineMagnet] = useState(false);
  const [isUpdatingPoint, setIsUpdatingPoint] = useState(false);
  const svgRef = useRef();
  const imageRef = useRef();

  useEffect(() => {
    const loadImage = async function(imageUri) {
      if (imageUri === null) {
        return;
      }

      try {
        const image = await cropImageToDataString(imageUri);
        setImage(image);
      } catch (error) {
        setImage(() => {
          throw error;
        });
      }
    };

    loadImage(imageUri);
  }, [imageUri]);

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
    setLineMagnet(e.shiftKey);
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
      onPointUpdated(selectedPointId, template, imagePosition);
    } else if (
      selectedPointId &&
      lines.find(line => line.id === selectedPointId)
    ) {
      const line = lines.find(line => line.id === selectedPointId);
      const newPoint = lineMagnet
        ? line.equation.closestPoint(imagePosition.x, imagePosition.y)
        : imagePosition;
      onPointUpdated(selectedPointId, template, newPoint);
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
  const parsedLinePoints = lines
    .filter(line => line.point)
    .map(line => {
      if (line.id === selectedPointId && isUpdatingPoint && movingPointer) {
        return { ...line.point, position: movingPointer };
      } else {
        return line.point;
      }
    });

  if (!image) return null;

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
        <image x="0" y="0" xlinkHref={image.imageData} ref={imageRef} />
        {lines.map(line => (
          <EpipolarLine
            width={width}
            height={height}
            equation={line.equation}
            color={line.color}
            active={line.id === selectedPointId}
            linePoint={
              movingPointer && line.id === selectedPointId && !line.point
                ? lineMagnet
                  ? line.equation.closestPoint(movingPointer.x, movingPointer.y)
                  : movingPointer
                : null
            }
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
        {parsedLinePoints.map(point => (
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
            stroke={pointCreate.options.color}
            fill="rgba(0,0,0,0)"
          />
        )}
      </g>
    </svg>
  );
};

export default EpipolarImage;
