import {
  CHANGE_ADD_ANNOTATION,
  DELETE_ANNOTATION_SUCCEED,
  SELECT_IMAGE_ANNOTATION,
  SELECT_IMAGE_ANNOTATION_BY_USER
} from "../actions";
import {
  CREATE_ANNOTATION_LOCAL,
  DELETE_ANNOTATION_LOCAL
} from "../state/annotation";
import { resetTaskItemActions } from "../state/taskItem";

export default (state = null, action, root) => {
  switch (action.type) {
    case SELECT_IMAGE_ANNOTATION:
    case SELECT_IMAGE_ANNOTATION_BY_USER:
      return action.annotationId != null ? action.annotationId : null;
    case CREATE_ANNOTATION_LOCAL:
      return action.annotation.id;
    // case SELECT_IMAGE:
    case DELETE_ANNOTATION_SUCCEED:
    case DELETE_ANNOTATION_LOCAL:
    case resetTaskItemActions.ACTION_SUCCEED:
      return null;
    case CHANGE_ADD_ANNOTATION:
      return action.addAnnotation ? null : state;
    default:
      return state;
  }
};
