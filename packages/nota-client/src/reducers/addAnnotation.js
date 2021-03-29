import {
  CHANGE_ADD_ANNOTATION,
  SELECT_IMAGE_ANNOTATION,
  SELECT_IMAGE_ANNOTATION_BY_USER
} from "../actions";
import { CREATE_ANNOTATION_LOCAL } from "../state/annotation";

export default (state = false, action, root) => {
  switch (action.type) {
    case CHANGE_ADD_ANNOTATION:
      return action.addAnnotation;
    case SELECT_IMAGE_ANNOTATION:
    case SELECT_IMAGE_ANNOTATION_BY_USER:
    case CREATE_ANNOTATION_LOCAL:
      return false;
    default:
      return state;
  }
};
