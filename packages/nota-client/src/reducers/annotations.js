import {
  DELETE_ANNOTATION_SUCCEED,
  PERSIST_ANNOTATION_SUCCEED
} from "../actions";
import { fetchTaskAssignmentActions } from "../state/taskAssignment";
import { resetTaskItemActions } from "../state/taskItem";
import {
  CREATE_ANNOTATION_LOCAL,
  UPDATE_ANNOTATION_LOCAL,
  DELETE_ANNOTATION_LOCAL
} from "../state/annotation";
import { selector } from "../lib/selector";
import { annotationDefaultLabels } from "../lib/annotationUtils";

const onFetchImageListSucceed = (state, action, root) => {
  /** @type {{[key: number]: Nota.Annotation}} */
  const annotations = {};
  /** @type {Nota.fetchImageListSucceedAction} */
  action.response.taskItems.forEach(taskItem => {
    if (taskItem.annotations) {
      taskItem.annotations.forEach(annotation => {
        annotations[annotation.id] = annotation;
      });
    }
  });
  return annotations;
};

const onPersistAnnotationSucceed = (state, action) => {
  const newState = { ...state, [action.annotation.id]: action.annotation };
  if (action.placeholderId) {
    delete newState[action.placeholderId];
  }
  return newState;
};

const onDeleteAnnotationSuceed = (state, action) => {
  const newState = { ...state };
  delete newState[action.annotation.id];
  return newState;
};

const onResetAnnotationSucceed = (state, action) => {
  const newState = { ...state };

  action.response.annotations.forEach(annotation => {
    newState[annotation.id] = annotation;
  });

  return newState;
};

const annotations = (state = {}, action, root) => {
  switch (action.type) {
    case CREATE_ANNOTATION_LOCAL:
      const labelsName = action.labelsName || root.addAnnotation;
      const db = selector(root);
      const annotationFields = db.select("folderTemplateAnnotations");
      const template = annotationFields.find(
        template => template.name === labelsName
      );

      return {
        ...state,
        [action.annotation.id]: {
          ...action.annotation,
          labelsName,
          labels: annotationDefaultLabels(template.labels, action.mediaDefaults)
        }
      };
    case UPDATE_ANNOTATION_LOCAL:
      const current = state[action.annotation.id] || {};
      return {
        ...state,
        [action.annotation.id]: { ...current, ...action.annotation }
      };
    case fetchTaskAssignmentActions.ACTION_SUCCEED:
      return onFetchImageListSucceed(state, action);
    case PERSIST_ANNOTATION_SUCCEED:
      return onPersistAnnotationSucceed(state, action);
    case DELETE_ANNOTATION_LOCAL:
    case DELETE_ANNOTATION_SUCCEED:
      return onDeleteAnnotationSuceed(state, action);
    case resetTaskItemActions.ACTION_SUCCEED:
      return onResetAnnotationSucceed(state, action);
    default:
      return state;
  }
};

export default annotations;
