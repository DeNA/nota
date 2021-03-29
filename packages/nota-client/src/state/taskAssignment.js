import { all, call, put, select, takeLatest } from "redux-saga/effects";
import { selectImage } from "../actions";
import { fetchTaskAssignment } from "../lib/api";
import history from "../lib/history";
import { selector } from "../lib/selector";
import { createAsyncAction, createAsyncReducer } from "./utils";

// ACTIONS
export const fetchTaskAssignmentActions = createAsyncAction(
  "FETCH_TASK_ASSIGNMENT"
);

// REDUCERS
export const taskAssignmentReducer = createAsyncReducer(
  fetchTaskAssignmentActions,
  null
);

// SAGAS
function* fetchTaskAssignmentSaga(action) {
  try {
    const { projectId, taskId, taskAssignmentId } = action.request;
    const state = yield select(state => state);
    const db = yield selector(state);
    const taskAssignment = yield call(fetchTaskAssignment, {
      projectId,
      taskId,
      taskAssignmentId
    });
    yield put(fetchTaskAssignmentActions.actionSucceed(taskAssignment));
    const selectedImageId = yield select(state => state.selectedImageId);
    if (!selectedImageId) {
      const imageId = yield call(db.select, "firstOngoingImageId");
      yield call(
        history.push,
        `/annotation/${projectId}/${taskId}/${taskAssignmentId}/${imageId}`
      );
    } else {
      yield put(selectImage(selectedImageId));
    }
  } catch (error) {
    yield put(fetchTaskAssignmentActions.actionError(error));
  }
}

export const taskSagas = function*() {
  yield all([
    takeLatest(fetchTaskAssignmentActions.ACTION, fetchTaskAssignmentSaga)
  ]);
};
