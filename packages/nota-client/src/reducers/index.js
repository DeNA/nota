import { taskAssignmentReducer as taskAssignment } from "../state/taskAssignment";
import { editableReducer } from "../state/editable";
import addAnnotation from "./addAnnotation";
import annotations from "./annotations";
import imageFilters from "./imageFilters";
import imageList from "./imageList";
import lastAction from "./lastAction";
import options from "./options";
import selectedAnnotationId from "./selectedAnnotationId";
import selectedImageId from "./selectedImageId";

const reducers = {
  imageList,
  selectedImageId,
  selectedAnnotationId,
  annotations,
  addAnnotation,
  imageFilters,
  options,
  lastAction,
  taskAssignment,
  editable: editableReducer
};

const notaApp = (state = {}, action) => {
  const newState = {};
  const keys = Object.keys(reducers);
  let changed = false;

  keys.forEach(key => {
    const current = state[key];
    const updated = reducers[key](current, action, state);

    newState[key] = updated;
    changed = changed || current !== updated;
  });

  return changed ? newState : state;
};

export default notaApp;
