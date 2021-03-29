import { all } from "redux-saga/effects";
import { projectSagas } from "../state/project";
import { taskSagas } from "../state/taskAssignment";
import { taskItemSagas } from "../state/taskItem";
import deleteAnnotation from "./deleteAnnotation";
import persistAnnotation from "./persistAnnotation";
import selectImage from "./selectImage";
import saveChanges from "./saveChanges";
import updateImageStatus from "./updateImageStatus";

function* notaSaga() {
  yield all([
    saveChanges(),
    selectImage(),
    persistAnnotation(),
    deleteAnnotation(),
    updateImageStatus(),
    taskSagas(),
    projectSagas(),
    taskItemSagas()
  ]);
}

export default notaSaga;
