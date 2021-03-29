import React, { Component } from "react";
import SVGImage from "./SVGImage";
import SVGFilterBrightness from "./SVGFilterBrightness";
import { Loader } from "./semantic";
import { cropImageToDataString } from "../../lib/image";

/**
 * @augments {Component<{
      imageUri: string,
      boundaries?: object,
      width?: string | number,
      height?: string | number,
      imageFilters?: object
    }, {}>}
 */
class SVGScaledImage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageData: null,
      imageSize: null,
      imageScale: null
    };
    this.loadImage();
  }
  componentWillReceiveProps(nextProps) {
    if (
      nextProps.imageUri !== this.props.imageUri ||
      JSON.stringify(nextProps.boundaries) !==
        JSON.stringify(this.props.boundaries)
    ) {
      this.setState(
        {
          imageData: null,
          imageSize: null,
          imageScale: null
        },
        () => this.loadImage()
      );
    }
  }
  componentDidMount() {
    this.componentIsMounted = true;
  }
  componentWillUnmount() {
    this.componentIsMounted = false;
  }
  componentDidUpdate() {
    this.resizeImage(this.getTransformations());
  }
  async loadImage() {
    const { imageUri, boundaries } = this.props;
    if (imageUri === null) {
      return;
    }

    try {
      const image = await cropImageToDataString(imageUri, boundaries);
      this.componentIsMounted && this.setState(image);
    } catch (error) {
      console.error(error);
    }
  }
  getTransformations() {
    const { imageData, imageSize } = this.state;
    if (imageData === null) {
      return {};
    }

    const widthInfo = { side: "width", axis: "x" };
    const heightInfo = { side: "height", axis: "y" };
    const imageLargeSide =
      imageSize.width > imageSize.height ? widthInfo : heightInfo;
    const imageShortSide =
      imageLargeSide === widthInfo ? heightInfo : widthInfo;
    const parentStyle = getComputedStyle(this.svg);
    const parentLargeSize = parseFloat(
      parentStyle.getPropertyValue(imageLargeSide.side)
    );
    const parentShortSize = parseFloat(
      parentStyle.getPropertyValue(imageShortSide.side)
    );
    const ratioLargeSize = parentLargeSize / imageSize[imageLargeSide.side];
    const projectedShortSize = imageSize[imageShortSide.side] * ratioLargeSize;
    const ratioShortSize =
      projectedShortSize > parentShortSize
        ? parentShortSize / projectedShortSize
        : 1;
    const resultLargeSize = parentLargeSize * ratioShortSize;
    const resultShortSize =
      ratioShortSize === 1
        ? projectedShortSize
        : projectedShortSize * ratioShortSize;
    const largeSideOffset =
      parentLargeSize - resultLargeSize > 0
        ? (parentLargeSize - resultLargeSize) / 2
        : 0;
    const shortSideOffset =
      parentShortSize - resultShortSize > 0
        ? (parentShortSize - resultShortSize) / 2
        : 0;
    const x = imageLargeSide.axis === "x" ? largeSideOffset : shortSideOffset;
    const y = imageLargeSide.axis === "y" ? largeSideOffset : shortSideOffset;
    const scale = resultLargeSize / imageSize[imageLargeSide.side];

    return { x, y, scale };
  }
  resizeImage(transformations) {
    const { scale, x, y } = transformations;
    const { imageData } = this.state;
    if (imageData === null) {
      return;
    }

    this.group.setAttribute(
      "transform",
      `translate(${x},${y}) scale(${scale})`
    );
  }
  render() {
    const { width = "100%", height = "100%", imageFilters = {} } = this.props;
    const { imageData, imageSize } = this.state;
    const id = `filter-${Math.random()}`;

    if (imageData === null) {
      return <Loader active inverted inline="centered" />;
    }

    return (
      <svg width={width} height={height} ref={svg => (this.svg = svg)}>
        <defs>
          <SVGFilterBrightness brightness={imageFilters.brightness} id={id} />
        </defs>
        <g ref={group => (this.group = group)}>
          <SVGImage
            imageData={imageData}
            imageSize={imageSize}
            filter={`url(#${id})`}
          />
        </g>
      </svg>
    );
  }
}

export default SVGScaledImage;
