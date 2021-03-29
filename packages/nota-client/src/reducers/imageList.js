import {
  DELETE_ANNOTATION_SUCCEED,
  PERSIST_ANNOTATION_SUCCEED,
  UPDATE_IMAGE_STATUS_SUCCEED
} from "../actions";
import { fetchTaskAssignmentActions } from "../state/taskAssignment";
import { resetTaskItemActions } from "../state/taskItem";
import {
  CREATE_ANNOTATION_LOCAL,
  DELETE_ANNOTATION_LOCAL
} from "../state/annotation";

export default (state = [], action, root) => {
  switch (action.type) {
    case fetchTaskAssignmentActions.ACTION_SUCCEED:
      return action.response.taskItems;
    case CREATE_ANNOTATION_LOCAL:
      return state.map(image => {
        if (image.id === root.selectedImageId) {
          const annotations = image.annotations || [];
          return {
            ...image,
            annotations: [...annotations, action.annotation]
          };
        } else {
          return image;
        }
      });
    case PERSIST_ANNOTATION_SUCCEED:
      if (!action.placeholderId) {
        return state;
      }

      return state.map(image => {
        if (image.id === action.annotation.taskItemId) {
          const annotations = image.annotations ? [...image.annotations] : [];
          return {
            ...image,
            annotations: annotations.map(annotation =>
              annotation.id === action.placeholderId
                ? action.annotation
                : annotation
            )
          };
        } else {
          return image;
        }
      });
    case DELETE_ANNOTATION_LOCAL:
    case DELETE_ANNOTATION_SUCCEED:
      return state.map(image => {
        if (image.id === action.annotation.taskItemId) {
          const annotations = image.annotations || [];
          const newAnnotations = annotations.filter(
            annotation => annotation.id !== action.annotation.id
          );
          return { ...image, annotations: newAnnotations };
        } else {
          return image;
        }
      });
    case UPDATE_IMAGE_STATUS_SUCCEED:
      return state.map(image => {
        return image.id === action.image.id ? action.image : image;
      });
    case resetTaskItemActions.ACTION_SUCCEED:
      return state.map(image => {
        return image.id === action.response.taskItemId
          ? {
              ...image,
              annotations: action.response.annotations || []
            }
          : image;
      });
    default:
      return state;
  }
};
