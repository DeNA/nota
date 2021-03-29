import React, { Component } from "react";
import ImageAnnotationLibrary from "svg-image-annotation";

const usableOptions = [
  "image",
  "annotations",
  "imageBrightness",
  "controlled",
  "showControls",
  "showLabels",
  "scale",
  "minScale",
  "maxScale",
  "maxScaleClick",
  "zoomSensibility",
  "outsideCanvas",
  "strokeWidth",
  "selectedAnnotationStrokeWidth",
  "selectedAnnotation",
  "annotationChanged",
  "annotationCreated",
  "annotationSelected"
];

/**
 * @augments {Component<{
      image: string,
      annotations?: object[],
      imageBrightness?: number,
      controlled?: boolean,
      showControls?: boolean,
      showLabels?: boolean | string,
      scale?: number,
      minScale?: number,
      maxScale?: number,
      maxScaleClick?: number,
      zoomSensibility?: number,
      outsideCanvas?: number,
      strokeWidth?: number,
      selectedAnnotationStrokeWidth?: number,
      selectedAnnotation?: string,
      annotationChanged?: ()=>any,
      annotationCreated?: ()=>any,
      annotationSelected?: ()=>any,
      draw?: object
    }, {}>}
 */
class ImageAnnotation extends Component {
  svg = null;
  imageAnnotation = null;
  componentDidMount() {
    const options = this.optionsFromProps(this.props);

    this.imageAnnotation = new ImageAnnotationLibrary(this.svg, options);
    if (this.props.draw) {
      this.imageAnnotation.drawAnnotation(this.props.draw);
    }
  }
  componentWillReceiveProps(newProps) {
    const options = this.optionsFromProps(newProps);

    if (newProps.draw !== this.props.draw) {
      this.imageAnnotation.drawAnnotation(newProps.draw);
    }

    this.imageAnnotation.setOptions(options);
  }
  componentWillUnmount() {
    this.imageAnnotation.destroy();
  }
  optionsFromProps(props) {
    const options = {};

    for (const option of usableOptions) {
      if (props[option] !== undefined) {
        options[option] = props[option];
      }
    }

    return options;
  }
  render() {
    return (
      <svg
        ref={svg => (this.svg = svg)}
        onContextMenu={e => e.preventDefault()}
      />
    );
  }
}

export default ImageAnnotation;
