import { select, put, takeEvery } from "redux-saga/effects";
import { selector } from "../lib/selector";
import { persistAnnotation } from "../actions";
import { CLOSE_TASK } from "../state/task";

/**
 * Save changes async
 */
export function* saveChanges() {
  try {
    const state = yield select(state => state);
    const db = yield selector(state);
    const annotations = yield db.select("dirtyAnnotations");

    for (let i = 0; i < annotations.length; i++) {
      yield put(persistAnnotation(annotations[i], true));
    }
  } catch (e) {
    // TODO: ???
    console.log(e);
  }
}

export default () => {
  return takeEvery(CLOSE_TASK, saveChanges);
};
