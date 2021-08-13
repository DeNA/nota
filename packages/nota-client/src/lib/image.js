import { fetch } from "./api";
import * as cache from "./cache";

const getKey = (imageUri, boundaries) => {
  return `${imageUri}--${JSON.stringify(boundaries)}`;
};

const calculateCropBoundaries = function(
  boundaries,
  { naturalHeight, naturalWidth }
) {
  switch (boundaries.type) {
    case "RECTANGLE": {
      return {
        left: boundaries.left || 0,
        top: boundaries.top || 0,
        right: boundaries.right || naturalWidth,
        bottom: boundaries.bottom || naturalHeight
      };
    }
    case "POINT": {
      const { x = 0, y = 0 } = boundaries.position || {};
      const offsetWidth = naturalWidth * 0.05;
      const offsetHeight = naturalHeight * 0.05;

      return {
        left: x - offsetWidth,
        top: y - offsetHeight,
        right: x + offsetWidth,
        bottom: y + offsetHeight
      };
    }
    case "POLYGON": {
      const { points = [] } = boundaries;
      const left = Math.max(Math.min(...points.map(p => p.x)), 0);
      const top = Math.max(Math.min(...points.map(p => p.y)), 0);
      const right = Math.min(Math.max(...points.map(p => p.x)), naturalWidth);
      const bottom = Math.min(Math.max(...points.map(p => p.y)), naturalHeight);

      return { left, top, right, bottom };
    }
    default: {
      return {
        left: 0,
        top: 0,
        right: naturalWidth,
        bottom: naturalHeight
      };
    }
  }
};

const cropImage = (image, boundaries) => {
  const {
    left = 0,
    top = 0,
    right = image.naturalWidth,
    bottom = image.naturalHeight
  } = calculateCropBoundaries(boundaries, image);
  const offsetX = left;
  const offsetY = top;
  const cropWidth = right - left;
  const cropHeight = bottom - top;

  const canvas = document.createElement("canvas");
  canvas.width = cropWidth;
  canvas.height = cropHeight;
  canvas
    .getContext("2d")
    .drawImage(
      image,
      offsetX,
      offsetY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );
  return [canvas.toDataURL("image/png"), cropWidth, cropHeight];
};

export const cropImageToDataString = async (imageUri, boundaries) => {
  const key = getKey(imageUri, boundaries || {});
  const promise =
    cache.get(key) ||
    new Promise(async (resolve, reject) => {
      if (imageUri === null) {
        reject(new Error("imageUri is required"));
      }

      const imageDataPromise = cache.get(imageUri) || fetch(imageUri);
      try {
        cache.add(imageUri, imageDataPromise);
        const imageData = await imageDataPromise;

        const image = new Image();

        image.onload = () => {
          const [imageDataCropped, cropWidth, cropHeight] = boundaries
            ? cropImage(image, boundaries)
            : [imageData, image.naturalWidth, image.naturalHeight];

          resolve({
            imageData: imageDataCropped,
            imageSize: {
              width: cropWidth,
              height: cropHeight
            }
          });
        };

        image.src = imageData;
      } catch (err) {
        cache.remove(imageUri);
        reject(err);
      }
    });

  cache.add(key, promise);
  try {
    const imageData = await promise;

    return imageData;
  } catch (err) {
    cache.remove(key);
    throw err;
  }
};
