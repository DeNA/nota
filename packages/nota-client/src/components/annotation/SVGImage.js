import React from "react";

const SVGImage = ({
  imageData,
  imageSize,
  filter = "",
  setRef = image => {}
}) => {
  if (imageData === null) {
    return null;
  }

  return (
    <image
      xlinkHref={imageData}
      x="0"
      y="0"
      height={imageSize.height}
      width={imageSize.width}
      filter={filter}
      ref={image => setRef(image)}
    />
  );
};

export default SVGImage;
