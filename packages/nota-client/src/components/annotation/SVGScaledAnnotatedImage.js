import React, { Component } from "react";
import { cropImageToDataString } from "../../lib/image";
import { Annotation } from "../../lib/models";
import ImageAnnotation from "./ImageAnnotation";
import {
  DEFAULT_ANNOTATION_COLOR,
  DEFAULT_SELECTED_ANNOTATION_COLOR
} from "../../constants";
import Icon from "../Icon";

/**
 * @augments {Component<{
      imageUri: string,
      lineWidth: number,
      editable: boolean,
      addNew: boolean,
      addNewColor: string,
      addNewOptions: any,
      annotations: object[],
      labelAnnotations: object[],
      dragLineWidth: number,
      showAnnotations: boolean,
      updateAnnotationBoundaries: any,
      selectedAnnotationId: any,
      selectAnnotation: any,
      createAnnotation: any,
      imageFilters: object,
      options: object,
      onToggleHideCompleted: any,
      showLabels: string,
      taskItemId: number
    }, {}>}
 */
class SVGScaledAnnotatedImage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      imageData: null,
      imageSize: null,
      newAnnotation: null,
      imageScale: null,
      annotations: props.annotations,
      hideCompleted: false
    };

    this.props.onToggleHideCompleted(this.toggleShowCompleted);
    this.loadImage();
  }
  componentWillReceiveProps(nextProps) {
    let newAnnotation = this.state.newAnnotation;

    if (
      nextProps.addNew !== this.props.addNew ||
      nextProps.addNewColor !== this.props.addNewColor
    ) {
      const { minHeight, minWidth } = nextProps.addNewOptions;

      newAnnotation = nextProps.addNew
        ? {
            id: "new_annotation_" + Math.random(),
            type: nextProps.addNew,
            properties: {
              style: {
                strokeColor: nextProps.addNewColor
              },
              minWidth,
              minHeight
            }
          }
        : null;
    }

    if (nextProps.imageUri !== this.props.imageUri) {
      this.setState(
        {
          imageData: null,
          imageSize: null,
          newAnnotation,
          imageScale: null,
          annotations: nextProps.annotations,
          hideCompleted: false
        },
        () => this.loadImage()
      );
    } else {
      this.setState({ annotations: nextProps.annotations, newAnnotation });
    }
  }
  toggleShowCompleted = () => {
    const { hideCompleted } = this.state;

    this.setState({ hideCompleted: !hideCompleted });
  };
  async loadImage() {
    const { imageUri } = this.props;
    if (imageUri === null) {
      return;
    }

    try {
      const image = await cropImageToDataString(imageUri);
      this.setState(image);
    } catch (error) {
      this.setState(() => {
        throw error;
      });
    }
  }
  getRectangleBoundaries = (properties, boundaries) => {
    const { x, y, height, width } = properties;

    return {
      ...boundaries,
      ...this.convertToBoundaries({ x, y, height, width })
    };
  };
  getPolygonBoundaries = (properties, boundaries) => {
    const { points } = properties;

    return { ...boundaries, points };
  };
  getPointBoundaries = (properties, boundaries) => {
    const { position } = properties;

    return { ...boundaries, position };
  };
  createAnnotation = created => {
    const { createAnnotation, taskItemId } = this.props;
    const { annotations } = this.state;

    let boundaries = {};

    if (created.type === "RECTANGLE") {
      boundaries = this.getRectangleBoundaries(created.properties);
      boundaries.type = "RECTANGLE";
    } else if (created.type === "POLYGON") {
      boundaries = this.getPolygonBoundaries(created.properties);
      boundaries.type = "POLYGON";
    } else if (created.type === "POINT") {
      boundaries = this.getPointBoundaries(created.properties);
      boundaries.type = "POINT";
    }

    const newAnnotations = [].concat(annotations);

    newAnnotations.push({
      id: created.id,
      boundaries
    });

    this.setState({ annotations: newAnnotations, newAnnotation: null }, () => {
      createAnnotation(taskItemId, boundaries);
    });
  };
  updateAnnotation = changed => {
    const { updateAnnotationBoundaries } = this.props;
    const { annotations } = this.state;
    const newAnnotations = [].concat(annotations);
    const index = newAnnotations.findIndex(
      annotation => annotation.id === changed.id
    );
    const annotation = newAnnotations[index];

    let boundaries = {};

    if (changed.type === "RECTANGLE") {
      boundaries = this.getRectangleBoundaries(
        changed.properties,
        annotation.boundaries
      );
    } else if (changed.type === "POLYGON") {
      boundaries = this.getPolygonBoundaries(
        changed.properties,
        annotation.boundaries
      );
    } else if (changed.type === "POINT") {
      boundaries = this.getPointBoundaries(
        changed.properties,
        annotation.boundaries
      );
    }

    newAnnotations.splice(index, 1, { ...annotation, boundaries });

    this.setState({ annotations: newAnnotations }, () => {
      updateAnnotationBoundaries(changed.id, boundaries);
    });
  };
  selectAnnotation = selected => {
    const { selectAnnotation } = this.props;

    selected && selectAnnotation(selected.id);
  };
  convertToBoundaries(box) {
    return {
      left: box.x,
      top: box.y,
      right: box.x + box.width,
      bottom: box.y + box.height
    };
  }
  getAnnotations() {
    const { selectedAnnotationId, editable, labelAnnotations } = this.props;
    const { annotations, hideCompleted } = this.state;

    const sorted = annotations
      .filter(annotation => annotation.boundaries && annotation.boundaries.type)
      .filter(annotation =>
        hideCompleted
          ? annotation.status === Annotation.STATUS.NOT_DONE ||
            annotation.id === selectedAnnotationId
          : true
      )
      .map(annotation => {
        const boundaries = annotation.boundaries;
        const properties = {};

        if (boundaries.type === "RECTANGLE") {
          const { minWidth, minHeight } = annotation.options ?? {};

          properties.x = boundaries.left;
          properties.y = boundaries.top;
          properties.width = boundaries.right - properties.x;
          properties.height = boundaries.bottom - properties.y;
          properties.minWidth = minWidth;
          properties.minHeight = minHeight;
        } else if (boundaries.type === "POLYGON") {
          properties.points = boundaries.points;
        } else if (boundaries.type === "POINT") {
          properties.position = boundaries.position;
        }
        properties.style = {
          strokeColor:
            annotation.id === selectedAnnotationId
              ? annotation.color || DEFAULT_SELECTED_ANNOTATION_COLOR
              : annotation.color || DEFAULT_ANNOTATION_COLOR
        };

        return {
          id: annotation.id,
          type: annotation.boundaries.type,
          label: annotation.label,
          selectable: true,
          editable:
            editable && annotation.status === Annotation.STATUS.NOT_DONE,
          properties
        };
      })
      .sort((a, b) => {
        if (a.id === selectedAnnotationId) {
          return 1;
        } else if (b.id === selectedAnnotationId) {
          return -1;
        } else {
          return 0;
        }
      });

    return labelAnnotations
      .map(annotation => ({ ...annotation, label: null }))
      .concat(sorted);
  }
  render() {
    const {
      selectedAnnotationId,
      imageFilters,
      showLabels,
      options
    } = this.props;
    const { imageData, newAnnotation, hideCompleted } = this.state;

    if (!imageData) {
      return null;
    }

    return (
      <>
        <div
          style={{
            position: "absolute",
            bottom: 3,
            right: 3,
            cursor: "pointer",
            opacity: hideCompleted ? 0.5 : 1
          }}
          title="Hide completed (q)"
          onClick={this.toggleShowCompleted}
        >
          <Icon name="eye" />
        </div>
        <ImageAnnotation
          image={imageData}
          imageBrightness={imageFilters.brightness || 0}
          outsideCanvas={0}
          showLabels={showLabels}
          annotations={this.getAnnotations()}
          controlled
          draw={newAnnotation}
          strokeWidth={2}
          selectedAnnotationStrokeWidth={2}
          minScale={options.minScale}
          maxScale={options.maxScale}
          maxScaleClick={options.maxScaleClick}
          zoomSensibility={options.zoomSensibility}
          selectedAnnotation={selectedAnnotationId}
          annotationChanged={this.updateAnnotation}
          annotationCreated={this.createAnnotation}
          annotationSelected={this.selectAnnotation}
        />
      </>
    );
  }
}

export default SVGScaledAnnotatedImage;
