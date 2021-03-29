/** @type {string} */
export const SELECT_IMAGE = "SELECT_IMAGE";
export const SELECT_IMAGE_ERROR = "SELECT_IMAGE_ERROR";

/**
 * @param {number} imageId
 * @return {Nota.selectImageAction}
 */
export function selectImage(imageId) {
  return { type: SELECT_IMAGE, imageId };
}

export function selectImageError(error) {
  return { type: SELECT_IMAGE_ERROR, error };
}
