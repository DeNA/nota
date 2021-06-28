import React, { useEffect, useState } from "react";
import { cropImageToDataString } from "../../lib/image";
import ImageAnnotation from "./ImageAnnotation";

const EpipolarImage = function({
  imageUri,
  template,
  points,
  lines,
  pointCreate,
  onPointCreated,
  selectedPointId,
  onPointSelected,
  onPointUpdated,
  options,
  imageFilters
}) {
  const [image, setImage] = useState(null);

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

  const handlePointSelected = function(point) {
    onPointSelected(point.id);
  };
  const handlePointCreated = function(point) {
    onPointCreated(pointCreate, template, point.properties.position);
  };
  const handlePointUpdated = function(point) {
    onPointUpdated(selectedPointId, template, point.properties.position);
  };

  const annotations = [...points, ...lines];

  if (!image) return null;

  return (
    <ImageAnnotation
      image={image.imageData}
      imageBrightness={imageFilters.brightness || 0}
      outsideCanvas={0}
      showLabels={false}
      annotations={annotations}
      controlled
      draw={pointCreate}
      strokeWidth={2}
      selectedAnnotationStrokeWidth={2}
      minScale={options.minScale}
      maxScale={options.maxScale}
      maxScaleClick={options.maxScaleClick}
      zoomSensibility={options.zoomSensibility}
      selectedAnnotation={selectedPointId}
      annotationChanged={handlePointUpdated}
      annotationCreated={handlePointCreated}
      annotationSelected={handlePointSelected}
    />
  );
};

export default EpipolarImage;
