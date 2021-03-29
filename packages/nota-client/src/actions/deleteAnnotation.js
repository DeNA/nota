/** @type {string} */
export const DELETE_ANNOTATION = "DELETE_ANNOTATION";

/** @type {string} */
export const DELETE_ANNOTATION_SUCCEED = "DELETE_ANNOTATION_SUCCEED";

/** @type {string} */
export const DELETE_ANNOTATION_ERROR = "DELETE_ANNOTATION_ERROR";

/**
 * @param {Nota.Annotation} annotation
 * @return {Nota.deleteAnnotationAction}
 */
export function deleteAnnotation(annotation) {
  return { type: DELETE_ANNOTATION, annotation };
}

/**
 * @param {Nota.Annotation} annotation
 * @return {Nota.deleteAnnotationSucceedAction}
 */
export function deleteAnnotationSucceed(annotation) {
  return { type: DELETE_ANNOTATION_SUCCEED, annotation };
}

/**
 * @param {Nota.Error} error
 * @return {Nota.deleteAnnotationErrorAction}
 */
export function deleteAnnotationError(error) {
  return { type: DELETE_ANNOTATION_ERROR, error };
}
