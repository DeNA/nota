import React from "react";
import EpipolarImage from "./EpipolarImage";
import { Annotation } from "../../lib/models";

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

/**
 * @param props {{
      imageBaseUri: string,
      annotations: object[],
      annotationTemplates: any,
      selectedAnnotationId: any,
      editable: boolean,
      lineWidth: number,
      dragLineWidth: number,
      addNew: boolean,
      addNewColor: string,
      showAnnotations: boolean,
      imageFilters: object,
      labelAnnotations: object[],
      taskItemId: number
      options: object,
      epipolarAnnotationOptions: any,
      createAnnotation: any,
      updateAnnotation: any,
      selectAnnotation: any,
      onToggleHideCompleted: any,
   }}
 */
const EpipolarImageAnnotation = function({
  imageBaseUri,
  annotations,
  annotationTemplates,
  selectedAnnotationId,
  editable,
  lineWidth,
  dragLineWidth,
  addNew,
  addNewColor,
  showAnnotations,
  imageFilters,
  labelAnnotations,
  taskItemId,
  options,
  epipolarAnnotationOptions,
  createAnnotation,
  updateAnnotation,
  selectAnnotation,
  onToggleHideCompleted
}) {
  const { imageSet, transformationMatrices } = epipolarAnnotationOptions;
  const handleAnnotationCreated = function(
    pointTemplate,
    imageTemplate,
    { x, y }
  ) {
    createAnnotation(taskItemId, {
      images: { [imageTemplate.id]: { x, y } },
      type: pointTemplate.type,
      startingImage: imageTemplate.id
    });
  };
  const handleAnnotationSelected = function(annotationId) {
    selectAnnotation(annotationId);
  };
  const handleAnnotationUpdated = function(pointId, imageTemplate, position) {
    const selectedAnnotation = annotations.find(
      annotation => annotation.id === selectedAnnotationId
    );
    const updatedBoundaries = { ...selectedAnnotation.boundaries };

    if (position === null) {
      delete updatedBoundaries.images[imageTemplate.id];
    } else {
      updatedBoundaries.images[imageTemplate.id] = {
        x: position.x,
        y: position.y
      };
    }
    updateAnnotation(selectedAnnotationId, updatedBoundaries);
  };

  const epipolarImages = imageSet.map(template => {
    return {
      template,
      points: annotations
        .filter(
          point =>
            point.boundaries.images[template.id] !== undefined &&
            point.boundaries.startingImage === template.id
        )
        .map(point => {
          const pointTemplate = annotationTemplates.find(
            pointTemplate => pointTemplate.name === point.labelsName
          );

          return {
            id: point.id,
            type: "POINT",
            imageId: template.id,
            properties: {
              position: {
                x: point.boundaries.images[template.id].x,
                y: point.boundaries.images[template.id].y
              },
              style: {
                strokeColor: pointTemplate.options.color
              }
            },
            selectable: true,
            editable: editable && point.status === Annotation.STATUS.NOT_DONE
          };
        }),
      lines: annotations
        .filter(point => {
          const pointTemplate = annotationTemplates.find(
            pointTemplate => pointTemplate.name === point.labelsName
          );
          return (
            pointTemplate.options.to.includes(template.id) &&
            point.boundaries.startingImage !== template.id
          );
        })
        .map(point => {
          const pointTemplate = annotationTemplates.find(
            pointTemplate => pointTemplate.name === point.labelsName
          );

          return {
            id: point.id,
            imageId: template.id,
            type: "EPIPOLAR_POINT",
            properties: {
              position: point.boundaries.images[template.id]
                ? {
                    x: point.boundaries.images[template.id].x,
                    y: point.boundaries.images[template.id].y
                  }
                : null,
              lineEquation:
                point.id === selectedAnnotationId
                  ? getEpipolarLineEquations(
                      point.boundaries.images[point.boundaries.startingImage].x,
                      point.boundaries.images[point.boundaries.startingImage].y,
                      transformationMatrices[
                        `${point.boundaries.startingImage}_${template.id}`
                      ]
                    )
                  : null,
              style: {
                strokeColor: pointTemplate.options.color
              }
            },
            selectable: true,
            editable: editable && point.status === Annotation.STATUS.NOT_DONE
          };
        })
    };
  });
  const pointCreate = addNew
    ? annotationTemplates.find(template => template.name === addNew)
    : null;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column"
      }}
    >
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
              imageUri={`${imageBaseUri}/${epipolarImage.template.id}`}
              points={epipolarImage.points}
              lines={epipolarImage.lines}
              pointCreate={
                pointCreate?.options?.from.includes(epipolarImage.template.id)
                  ? pointCreate
                  : null
              }
              onPointCreated={handleAnnotationCreated}
              selectedPointId={selectedAnnotationId}
              onPointSelected={handleAnnotationSelected}
              onPointUpdated={handleAnnotationUpdated}
              options={options}
              imageFilters={imageFilters}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default EpipolarImageAnnotation;
