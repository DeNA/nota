import { connect } from "react-redux";
import { selectImageAnnotationByUser } from "../../../actions";
import {
  ANNOTATION_DRAGLINE_WIDTH,
  ANNOTATION_LINE_WIDTH,
  DEFAULT_ANNOTATION_COLOR
} from "../../../constants";
import { selector } from "../../../lib/selector";
import hotkeys from "../../../lib/Hotkeys";
import {
  createAnnotationLocal,
  updateAnnotationLocal
} from "../../../state/annotation";
import EpipolarImageAnnotation from "../EpipolarImageAnnotation";

const mapStateToProps = state => {
  const db = selector(state);
  const annotations = db.select("imageAnnotations");
  const newAnnotationType = db.select("newAnnotationType");

  return {
    imageBaseUri: db.select("imageUri"),
    annotations,
    annotationTemplates: db.select("folderTemplateAnnotations"),
    selectedAnnotationId: state.selectedAnnotationId,
    editable: !db.select("imageDone"),
    lineWidth: ANNOTATION_LINE_WIDTH,
    dragLineWidth: ANNOTATION_DRAGLINE_WIDTH,
    addNew: (newAnnotationType && newAnnotationType.name) || false,
    addNewColor:
      (newAnnotationType &&
        newAnnotationType.options &&
        newAnnotationType.options.color) ||
      DEFAULT_ANNOTATION_COLOR,
    showAnnotations: !state.addAnnotation,
    imageFilters: state.imageFilters,
    labelAnnotations: db.select("annotationFieldAnnotations", annotations),
    taskItemId: state.selectedImageId,
    options: state.options,
    epipolarAnnotationOptions: db.select("folderTemplateMediaOptions")
  };
};

const mapDispatchToProps = dispatch => {
  return {
    createAnnotation: (taskItemId, boundaries) => {
      dispatch(createAnnotationLocal({ taskItemId, boundaries }));
    },
    updateAnnotation: (annotationId, boundaries) => {
      dispatch(
        updateAnnotationLocal({
          boundaries,
          id: annotationId
        })
      );
    },
    selectAnnotation: annotationId => {
      dispatch(selectImageAnnotationByUser(annotationId));
    }
  };
};

const bindings = {
  onToggleHideCompleted: "q"
};
const EpipolarImageContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(hotkeys(bindings)(EpipolarImageAnnotation));
export default EpipolarImageContainer;
