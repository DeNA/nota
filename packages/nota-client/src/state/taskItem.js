import { all, call, put, select, takeEvery } from "redux-saga/effects";
import { resetTaskItem } from "../lib/api";
import { createAsyncAction } from "./utils";
import { selector } from "../lib/selector";
import { selectImageAnnotation } from "../actions";

// ACTIONS
export const resetTaskItemActions = createAsyncAction("RESET_MEDIA_ITEMS");

// SAGAS
function* resetTaskItemSaga(action) {
  try {
    const projectId = yield select(
      state => state.taskAssignment.data.project.id
    );
    const taskId = yield select(state => state.taskAssignment.data.task.id);
    const { taskItemId } = action.request;
    const annotations = yield call(resetTaskItem, {
      projectId,
      taskId,
      taskItemId
    });
    yield put(resetTaskItemActions.actionSucceed({ annotations, taskItemId }));

    const state = yield select(state => state);
    const db = yield selector(state);
    const annotationId = yield call(db.select, "firstOngoingImageAnnotationId");

    if (annotationId) {
      yield put(selectImageAnnotation(annotationId));
    }
  } catch (error) {
    yield put(resetTaskItemActions.actionError(error));
  }
}

export const taskItemSagas = function*() {
  yield all([takeEvery(resetTaskItemActions.ACTION, resetTaskItemSaga)]);
};
