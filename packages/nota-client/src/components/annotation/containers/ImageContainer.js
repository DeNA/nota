import { connect } from "react-redux";
import { selectImageAnnotationByUser } from "../../../actions";
import SVGScaledAnnotatedImage from "../SVGScaledAnnotatedImage";
import {
  ANNOTATION_DRAGLINE_WIDTH,
  ANNOTATION_LINE_WIDTH,
  OPTION_LABEL_SHOW_HOVER,
  OPTION_LABEL_SHOW_ALWAYS,
  DEFAULT_ANNOTATION_COLOR
} from "../../../constants";
import { selector } from "../../../lib/selector";
import hotkeys from "../../../lib/Hotkeys";
import {
  createAnnotationLocal,
  updateAnnotationLocal
} from "../../../state/annotation";

const mapStateToProps = state => {
  const db = selector(state);
  const annotations = db.select("imageAnnotations");
  const showLabels = state.options.labelsShow
    ? state.options.labelsShow === OPTION_LABEL_SHOW_HOVER
      ? "hover"
      : state.options.labelsShow === OPTION_LABEL_SHOW_ALWAYS
      ? "always"
      : null
    : "hover";
  const newAnnotationType = db.select("newAnnotationType");

  return {
    imageUri: db.select("imageUri"),
    annotations,
    selectedAnnotationId: state.selectedAnnotationId,
    editable: !db.select("imageDone"),
    lineWidth: ANNOTATION_LINE_WIDTH,
    dragLineWidth: ANNOTATION_DRAGLINE_WIDTH,
    addNew: (newAnnotationType && newAnnotationType.type) || false,
    addNewColor:
      (newAnnotationType &&
        newAnnotationType.options &&
        newAnnotationType.options.color) ||
      DEFAULT_ANNOTATION_COLOR,
    showAnnotations: !state.addAnnotation,
    imageFilters: state.imageFilters,
    labelAnnotations: db.select("annotationFieldAnnotations", annotations),
    showLabels: showLabels,
    taskItemId: state.selectedImageId,
    options: state.options
  };
};

const mapDispatchToProps = dispatch => {
  return {
    createAnnotation: (taskItemId, boundaries) => {
      dispatch(createAnnotationLocal({ taskItemId, boundaries }));
    },
    updateAnnotationBoundaries: (annotationId, boundaries) => {
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
const ImageContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(hotkeys(bindings)(SVGScaledAnnotatedImage));
export default ImageContainer;
