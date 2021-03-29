import React, { Component } from "react";
import AnnotationLabel from "./AnnotationLabel";
import AnnotationLabelAnnotationGroupView from "./AnnotationLabelAnnotationGroupView";
import { cropImageToDataString } from "../../lib/image";
import { Loader } from "./semantic";
import "./AnnotationLabelAnnotationGroup.css";
import { annotationGroupAnnotations } from "../../lib/annotationUtils";
import { DEFAULT_ANNOTATION_COLOR } from "../../constants";

/**
 * @augments {Component<{
      label: any,
      value?: object,
      onChange: any,
      imageUri: string,
      imageFilters: object,
      options: object,
      boundaries: object,
      editable: boolean,
      annotationId: number,
      focus: boolean
    },{}>} 
 */
class AnnotationLabelAnnotationGroup extends Component {
  constructor(props) {
    super(props);
    const { label, annotationId, value, boundaries } = props;
    this.state = {
      imageData: null,
      imageSize: null,
      annotations: this.parseAnnotations(
        label,
        annotationId,
        value,
        boundaries
      ),
      newAnnotation: null
    };
    this.loadImage();
  }
  componentWillReceiveProps(nextProps) {
    const { label, annotationId, value, boundaries } = nextProps;
    const annotations = this.parseAnnotations(
      label,
      annotationId,
      value,
      boundaries
    );

    if (
      nextProps.imageUri !== this.props.imageUri ||
      JSON.stringify(nextProps.boundaries) !==
        JSON.stringify(this.props.boundaries)
    ) {
      this.setState(
        {
          imageData: null,
          imageSize: null,
          newAnnotation: null,
          annotations
        },
        () => this.loadImage()
      );
    } else {
      this.setState({ annotations });
    }
  }
  parseAnnotations(label, annotationId, value, boundaries) {
    return annotationGroupAnnotations(label, annotationId, value).map(
      annotation => {
        if (annotation.hasAnnotation && annotation.type === "RECTANGLE") {
          const position = this.inPosition(
            {
              x: annotation.properties.x,
              y: annotation.properties.y
            },
            boundaries
          );
          return {
            ...annotation,
            editable: true,
            properties: { ...annotation.properties, ...position }
          };
        } else if (annotation.hasAnnotation && annotation.type === "POLYGON") {
          const points = annotation.properties.points.map(point =>
            this.inPosition(point, boundaries)
          );
          return {
            ...annotation,
            editable: true,
            properties: { ...annotation.properties, points }
          };
        } else if (annotation.hasAnnotation && annotation.type === "POINT") {
          const position = this.inPosition(
            annotation.properties.position,
            boundaries
          );
          return {
            ...annotation,
            editable: true,
            properties: { ...annotation.properties, position }
          };
        } else {
          return annotation;
        }
      }
    );
  }
  async loadImage() {
    const { imageUri, boundaries } = this.props;
    if (imageUri === null) {
      return;
    }

    try {
      const image = await cropImageToDataString(imageUri, boundaries);
      this.setState(image);
    } catch (error) {
      console.error(error);
    }
  }
  inPosition(position, boundaries) {
    return {
      x: position.x ? position.x - boundaries.left : position.x,
      y: position.y ? position.y - boundaries.top : position.y
    };
  }
  outPosition(position) {
    const { boundaries } = this.props;

    return {
      x: position.x + boundaries.left,
      y: position.y + boundaries.top
    };
  }
  handleDeleted = id => {
    const { onChange, value, label } = this.props;
    const { annotations } = this.state;

    const idData = id.split("@@");
    const labelName = idData[1];
    const currentLabel = label.options.items.find(
      label => label.name === labelName
    );
    let labelData;

    if (currentLabel.type === "POINT_GROUP") {
      labelData = value[labelName] ? [].concat(value[labelName]) : [];
      const pointId = idData[2];
      const index = labelData.findIndex(point => point.id === pointId);

      if (index !== -1) {
        const point = labelData[index];
        if (point.itemOption) {
          labelData.splice(index, 1, {
            id: pointId,
            itemOption: point.itemOption
          });
        } else {
          labelData.splice(index, 1);
        }
      }
    } else {
      if (value[labelName] && value[labelName].itemOption) {
        labelData = {
          id: value[labelName].id,
          itemOption: value[labelName].itemOption
        };
      } else {
        labelData = null;
      }
    }

    const newAnnotations = [...annotations];
    const index = newAnnotations.findIndex(annotation => annotation.id === id);

    if (index !== -1) {
      const annotation = newAnnotations[index];
      if (annotation.itemOption) {
        newAnnotations.splice(index, 1, {
          id: annotation.id,
          itemOption: annotation.itemOption
        });
      } else {
        newAnnotations.splice(index, 1);
      }
    }

    this.setState({ annotations: newAnnotations }, () => {
      onChange(currentLabel, labelData);
    });
  };
  handleChanged = (changed, isItemOption = false) => {
    const { onChange, value, label } = this.props;
    const { annotations } = this.state;

    const idData = changed.id.split("@@");
    const labelName = idData[1];
    const currentLabel = label.options.items.find(
      label => label.name === labelName
    );
    let labelData;

    if (currentLabel.type === "RECTANGLE") {
      labelData = value[labelName] ? { ...value[labelName] } : {};

      if (isItemOption) {
        labelData.itemOption = changed.itemOption;
      } else {
        const { x, y } = this.outPosition(changed.properties);

        labelData.left = x;
        labelData.top = y;
        labelData.right = x + changed.properties.width;
        labelData.bottom = y + changed.properties.height;
      }
    } else if (currentLabel.type === "POLYGON") {
      labelData = value[labelName] ? { ...value[labelName] } : {};

      if (isItemOption) {
        labelData.itemOption = changed.itemOption;
      } else {
        const points = changed.properties.points.map(point =>
          this.outPosition(point)
        );
        labelData.points = points;
      }
    } else if (currentLabel.type === "POINT_GROUP") {
      labelData = value[labelName] ? [].concat(value[labelName]) : [];
      const id = idData[2];
      const index = labelData.findIndex(point => point.id === id);
      let point = {
        ...(labelData[index] || {}),
        id
      };

      if (isItemOption) {
        point.itemOption = changed.itemOption;
      } else {
        const position = this.outPosition(changed.properties.position);
        point = { ...point, ...position };
      }

      if (index !== -1) {
        labelData.splice(index, 1, point);
      } else {
        labelData.push(point);
      }
    }

    const newAnnotations = [...annotations];
    const index = newAnnotations.findIndex(
      annotation => annotation.id === changed.id
    );
    if (index !== -1) {
      newAnnotations.splice(index, 1, { ...newAnnotations[index], ...changed });
    }

    this.setState({ annotations: newAnnotations }, () => {
      onChange(currentLabel, labelData);
    });
  };
  handleNewAnnotation = (label, id) => {
    if (!label) {
      return this.setState({ newAnnotation: null });
    }

    switch (label.type) {
      case "POINT":
        this.setState({
          newAnnotation: {
            id,
            type: "POINT",
            properties: {
              style: {
                strokeColor: label.color || DEFAULT_ANNOTATION_COLOR
              }
            }
          }
        });
        break;
      case "RECTANGLE":
        this.setState({
          newAnnotation: {
            id,
            type: "RECTANGLE",
            properties: {
              style: {
                strokeColor: label.color || DEFAULT_ANNOTATION_COLOR
              }
            }
          }
        });
        break;
      case "POLYGON":
        this.setState({
          newAnnotation: {
            id,
            type: "POLYGON",
            properties: {
              style: {
                strokeColor: label.color || DEFAULT_ANNOTATION_COLOR
              }
            }
          }
        });
        break;
      default:
    }
  };
  annotationsSetEditable(annotations) {
    const { editable } = this.props;

    return annotations.map(annotation => {
      return {
        ...annotation,
        editable: editable,
        selectable: true
      };
    });
  }
  renderContents() {
    const {
      label,
      annotationId,
      imageFilters,
      options,
      editable,
      focus
    } = this.props;
    const { imageData, annotations, newAnnotation } = this.state;

    if (imageData === null) {
      return <Loader active inverted inline="centered" />;
    }

    return (
      <AnnotationLabelAnnotationGroupView
        annotations={this.annotationsSetEditable(annotations)}
        annotationId={annotationId}
        imageUri={imageData}
        imageFilters={imageFilters}
        options={options}
        label={label}
        editable={editable}
        newAnnotation={newAnnotation}
        onDelete={this.handleDeleted}
        onUpdate={this.handleChanged}
        onAddAnnotation={this.handleNewAnnotation}
        focus={focus}
      />
    );
  }
  render() {
    const { label, value } = this.props;

    return (
      <AnnotationLabel
        label={label.label}
        contents={this.renderContents()}
        required={label.options.required}
        hasValue={value !== undefined}
        expands
      />
    );
  }
}

export default AnnotationLabelAnnotationGroup;
