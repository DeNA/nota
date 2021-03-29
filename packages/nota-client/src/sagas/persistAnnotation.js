import { call, put, putResolve, select, takeEvery } from "redux-saga/effects";
import {
  persistAnnotationError,
  persistAnnotationSucceed,
  PERSIST_ANNOTATION,
  selectImageAnnotation
} from "../actions";
import { persistAnnotation, updateAnnotation } from "../lib/api";
import { Annotation } from "../lib/models";
import { selector } from "../lib/selector";

export const ANNOTATIONS_SAVING = new Set();
/**
 * PERSIST_ANNOTATION
 */
function* saga(action) {
  let serializedAnnotation;
  try {
    const projectId = yield select(
      state => state.taskAssignment.data.project.id
    );
    const taskId = yield select(state => state.taskAssignment.data.task.id);
    const state = yield select(state => state);
    const db = yield selector(state);
    const annotation = yield db.select("annotation", action.annotation.id);
    serializedAnnotation = JSON.stringify(annotation);

    if (ANNOTATIONS_SAVING.has(serializedAnnotation)) {
      return;
    } else {
      ANNOTATIONS_SAVING.add(serializedAnnotation);
    }

    if (annotation.isNew) {
      const savedAnnotation = yield call(persistAnnotation, {
        projectId,
        taskId,
        taskItemId: annotation.taskItemId,
        annotation: {
          labels: annotation.labels,
          labelsName: annotation.labelsName,
          boundaries: annotation.boundaries,
          status: action.annotation.status
        }
      });
      yield putResolve(
        persistAnnotationSucceed(savedAnnotation, annotation.id)
      );
    } else {
      const savedAnnotation = yield call(updateAnnotation, {
        projectId,
        taskId,
        taskItemId: annotation.taskItemId,
        annotation: {
          id: annotation.id,
          labels: annotation.labels,
          boundaries: annotation.boundaries,
          status: action.annotation.status
        }
      });
      yield putResolve(persistAnnotationSucceed(savedAnnotation));
    }

    if (action.annotation.status === Annotation.STATUS.DONE && !action.silent) {
      const state = yield select(state => state);
      const db = yield selector(state);
      const annotationId = yield call(
        db.select,
        "firstOngoingImageAnnotationId"
      );
      yield put(selectImageAnnotation(annotationId));
    }
  } catch (e) {
    yield put(persistAnnotationError(e));
  } finally {
    ANNOTATIONS_SAVING.delete(serializedAnnotation);
  }
}

export default () => {
  return takeEvery(PERSIST_ANNOTATION, saga);
};
