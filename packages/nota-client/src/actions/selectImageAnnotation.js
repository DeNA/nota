/** @type {string} */
export const SELECT_IMAGE_ANNOTATION = "SELECT_IMAGE_ANNOTATION";
export const SELECT_IMAGE_ANNOTATION_BY_USER =
  "SELECT_IMAGE_ANNOTATION_BY_USER";

/**
 * @param {number} annotationId
 * @param {number=} imageId
 * @return {Nota.selectImageAnnotationAction}
 */
export function selectImageAnnotation(annotationId, imageId) {
  return { type: SELECT_IMAGE_ANNOTATION, annotationId, imageId };
}

/**
 * @param {number} annotationId
 * @param {number=} imageId
 * @return {Nota.selectImageAnnotationAction}
 */
export function selectImageAnnotationByUser(annotationId, imageId) {
  return { type: SELECT_IMAGE_ANNOTATION_BY_USER, annotationId, imageId };
}
