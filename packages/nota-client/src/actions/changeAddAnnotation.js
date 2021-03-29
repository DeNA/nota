/** @type {string} */
export const CHANGE_ADD_ANNOTATION = "CHANGE_ADD_ANNOTATION";

/**
 * @param {boolean} addAnnotation
 * @return {Nota.changeAddAnnotationAction}
 */
export function changeAddAnnotation(addAnnotation) {
  return { type: CHANGE_ADD_ANNOTATION, addAnnotation };
}
