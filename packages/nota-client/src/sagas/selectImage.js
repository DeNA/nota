import { call, put, select, takeEvery, spawn } from "redux-saga/effects";
import {
  selectImageError,
  selectImageAnnotation,
  SELECT_IMAGE
} from "../actions";
import { MEDIA_TYPE } from "../constants";
import { cropImageToDataString } from "../lib/image";
import { selector } from "../lib/selector";
import { saveChanges } from "./saveChanges";

/**
 * SELECT_IMAGE
 */
function* saga(action) {
  try {
    const state = yield select(state => state);
    const db = yield selector(state);
    if (action.imageId === null) {
      return;
    }

    yield spawn(saveChanges, state.selectedImageId);

    const annotationId = yield call(
      db.select,
      "firstOngoingImageAnnotationId",
      action.imageId
    );
    yield put(selectImageAnnotation(annotationId, action.imageId));

    // Eager load images
    const template = db.select("folderTemplate");
    if (template.mediaType !== MEDIA_TYPE.IMAGE) {
      return;
    }
    const currentIndex = state.imageList.findIndex(
      image => image.id === action.imageId
    );
    if (currentIndex > -1) {
      for (let i = -1; i < 3; i++) {
        state.imageList[currentIndex + i] &&
          cropImageToDataString(
            db.select("imageUri", state.imageList[currentIndex + i].id)
          );
      }
    }
  } catch (e) {
    yield put(selectImageError(e));
  }
}

export default () => {
  return takeEvery(SELECT_IMAGE, saga);
};
