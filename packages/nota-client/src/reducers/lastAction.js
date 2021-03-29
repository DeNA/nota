import {
  SELECT_IMAGE_ANNOTATION_BY_USER,
  SELECT_IMAGE_ANNOTATION
} from "../actions";
import {
  ACTION_CREATE_ANNOTATION,
  ACTION_SELECT_ANNOTATION,
  ACTION_SELECT_ANNOTATION_USER
} from "../constants";
import { CREATE_ANNOTATION_LOCAL } from "../state/annotation";

export default (state = null, action, root) => {
  switch (action.type) {
    case CREATE_ANNOTATION_LOCAL:
      return ACTION_CREATE_ANNOTATION;
    case SELECT_IMAGE_ANNOTATION:
      return ACTION_SELECT_ANNOTATION;
    case SELECT_IMAGE_ANNOTATION_BY_USER:
      return ACTION_SELECT_ANNOTATION_USER;
    default:
      return state;
  }
};
