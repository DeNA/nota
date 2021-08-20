import { call, put, select, takeEvery, spawn } from "redux-saga/effects";
import {
  selectImageError,
  selectImageAnnotation,
  SELECT_IMAGE
} from "../actions";
import { MEDIA_TYPE } from "../constants";
import { getVis } from "../lib/binaryVis";
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

    // Eager load
    const template = db.select("folderTemplate");
    const { timelineVis = [] } = db.select("folderTemplateMediaOptions");
    const currentIndex = state.imageList.findIndex(
      image => image.id === action.imageId
    );

    if (currentIndex === -1) {
      return;
    }

    // Video Timeline Visualizations
    if (template.mediaType === MEDIA_TYPE.VIDEO && timelineVis.length > 0) {
      const projectId = state.taskAssignment?.data?.project?.id;
      const taskId = state.taskAssignment?.data?.task?.id;

      if (!projectId || !taskId) {
        return;
      }

      // Previous video
      state.imageList[currentIndex - 1] &&
        getVis(projectId, taskId, state.imageList[currentIndex - 1].id);
      // Current video
      state.imageList[currentIndex] &&
        getVis(projectId, taskId, state.imageList[currentIndex].id);
      // Next video
      state.imageList[currentIndex + 1] &&
        getVis(projectId, taskId, state.imageList[currentIndex + 1].id);

      // Images
    } else if (template.mediaType === MEDIA_TYPE.IMAGE) {
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
