import { call, put, select, takeEvery } from "redux-saga/effects";
import {
  updateImageStatusError,
  updateImageStatusSucceed,
  UPDATE_IMAGE_STATUS
} from "../actions";
import { IMAGE_STATUS_DONE } from "../constants";
import { updateTaskItem } from "../lib/api";
import history from "../lib/history";
import { selector } from "../lib/selector";

export const IMAGES_SAVING = new Set();

function* saga(action) {
  let serializedImage;
  try {
    serializedImage = JSON.stringify(action.image);

    if (IMAGES_SAVING.has(serializedImage)) {
      return;
    } else {
      IMAGES_SAVING.add(serializedImage);
    }
    const projectId = yield select(
      state => state.taskAssignment.data.project.id
    );
    const taskId = yield select(state => state.taskAssignment.data.task.id);
    const image = yield call(updateTaskItem, {
      projectId,
      taskId,
      taskItem: action.image
    });
    yield put(updateImageStatusSucceed(image));

    if (action.image.status === IMAGE_STATUS_DONE) {
      const state = yield select(state => state);
      const db = yield selector(state);
      const imageId = yield call(db.select, "firstOngoingImageId");
      yield call(history.push, `${imageId}`);
    }
  } catch (e) {
    yield put(updateImageStatusError(e));
  } finally {
    IMAGES_SAVING.delete(serializedImage);
  }
}

export default () => {
  return takeEvery(UPDATE_IMAGE_STATUS, saga);
};
