/** @type {string} */
export const PERSIST_ANNOTATION = "PERSIST_ANNOTATION";

/** @type {string} */
export const PERSIST_ANNOTATION_SUCCEED = "PERSIST_ANNOTATION_SUCCEED";

/** @type {string} */
export const PERSIST_ANNOTATION_ERROR = "PERSIST_ANNOTATION_ERROR";

/**
 * @param {Nota.Annotation} annotation
 * @return {Nota.persistAnnotationAction}
 */
export function persistAnnotation(annotation, silent = false) {
  return { type: PERSIST_ANNOTATION, annotation, silent };
}

/**
 * @param {Nota.Annotation} annotation
 * @return {Nota.persistAnnotationSucceedAction}
 */
export function persistAnnotationSucceed(annotation, placeholderId = null) {
  return { type: PERSIST_ANNOTATION_SUCCEED, annotation, placeholderId };
}

/**
 * @param {Nota.Error} error
 * @return {Nota.persistAnnotationErrorAction}
 */
export function persistAnnotationError(error) {
  return { type: PERSIST_ANNOTATION_ERROR, error };
}
