import { Annotation } from "../lib/models";

export const CREATE_ANNOTATION_LOCAL = "CREATE_ANNOTATION_LOCAL";
export const UPDATE_ANNOTATION_LOCAL = "UPDATE_ANNOTATION_LOCAL";
export const DELETE_ANNOTATION_LOCAL = "DELETE_ANNOTATION_LOCAL";

export function createAnnotationLocal(
  annotation,
  labelsName = undefined,
  mediaDefaults = undefined
) {
  const id = `new_${Math.random()}`;
  return {
    type: CREATE_ANNOTATION_LOCAL,
    annotation: {
      ...annotation,
      id,
      isNew: true,
      status: Annotation.STATUS.NOT_DONE
    },
    labelsName,
    mediaDefaults
  };
}

export function updateAnnotationLocal(annotation) {
  return {
    type: UPDATE_ANNOTATION_LOCAL,
    annotation: { ...annotation, isDirty: true }
  };
}

export function deleteAnnotationLocal(annotation) {
  return { type: DELETE_ANNOTATION_LOCAL, annotation };
}
