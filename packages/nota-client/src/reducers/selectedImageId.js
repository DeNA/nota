import {
  SELECT_IMAGE_ANNOTATION,
  SELECT_IMAGE_ANNOTATION_BY_USER
} from "../actions";

export default (state = null, action, root) => {
  switch (action.type) {
    case SELECT_IMAGE_ANNOTATION:
    case SELECT_IMAGE_ANNOTATION_BY_USER:
      return action.imageId !== undefined ? action.imageId : state;
    default:
      return state;
  }
};
