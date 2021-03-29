import { call, put, putResolve, select, takeEvery } from "redux-saga/effects";
import {
  deleteAnnotationError,
  deleteAnnotationSucceed,
  DELETE_ANNOTATION,
  selectImageAnnotation
} from "../actions";
import { deleteAnnotation } from "../lib/api";
import { selector } from "../lib/selector";
import { deleteAnnotationLocal } from "../state/annotation";

/**
 * DELETE_ANNOTATION
 */
function* saga(action) {
  try {
    const projectId = yield select(
      state => state.taskAssignment.data.project.id
    );
    const taskId = yield select(state => state.taskAssignment.data.task.id);
    const taskItemId = yield select(state => state.selectedImageId);

    if (action.annotation.isNew) {
      const state = yield select(state => state);
      const db = yield selector(state);
      const annotation = yield db.select("annotation", action.annotation.id);
      yield putResolve(deleteAnnotationLocal({ ...annotation, taskItemId }));
    } else {
      yield call(deleteAnnotation, {
        projectId,
        taskId,
        taskItemId,
        annotationId: action.annotation.id
      });
      yield putResolve(deleteAnnotationSucceed(action.annotation));
    }

    const state = yield select(state => state);
    const db = yield selector(state);
    const annotationId = yield call(db.select, "firstOngoingImageAnnotationId");
    yield put(selectImageAnnotation(annotationId));
  } catch (e) {
    yield put(deleteAnnotationError(e));
  }
}

export default () => {
  return takeEvery(DELETE_ANNOTATION, saga);
};
