import { call, put, takeLatest, all } from "redux-saga/effects";
import { createAsyncAction, createAsyncReducer } from "./utils";
import { fetchProjects, fetchProject } from "../lib/api";

// ACTIONS
export const fetchProjectsActions = createAsyncAction("FETCH_PROJECTS");
export const fetchProjectActions = createAsyncAction("FETCH_PROJECT");

// REDUCERS
export const projectsReducer = createAsyncReducer(fetchProjectsActions, []);
export const projectReducer = createAsyncReducer(fetchProjectActions, null);

// SAGAS
function* fetchProjectsSaga(action) {
  try {
    const projects = yield call(fetchProjects);
    yield put(fetchProjectsActions.actionSucceed(projects));
  } catch (error) {
    yield put(fetchProjectsActions.actionError(error));
  }
}

function* fetchProjectSaga(action) {
  try {
    const project = yield call(fetchProject, action.request.projectId);
    yield put(fetchProjectActions.actionSucceed(project));
  } catch (error) {
    yield put(fetchProjectActions.actionError(error));
  }
}

export const projectSagas = function*() {
  yield all([
    takeLatest(fetchProjectActions.ACTION, fetchProjectSaga),
    takeLatest(fetchProjectsActions.ACTION, fetchProjectsSaga)
  ]);
};
