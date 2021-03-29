import { connect } from "react-redux";
import AnnotationLabelStatus from "../AnnotationLabelStatus";
import { persistAnnotation } from "../../../actions";
import hotkeys from "../../../lib/Hotkeys";
import { selector } from "../../../lib/selector";
import { Annotation } from "../../../lib/models";

const mapStateToProps = state => {
  const db = selector(state);

  return {
    editable: state.editable,
    done: db.select("annotationDone"),
    annotationId: state.selectedAnnotationId,
    imageDone: db.select("imageDone"),
    canBeSetAsDone: db.select("canAnnotationBeSetAsDone"),
    taskItemId: state.selectedImageId
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onDoneChange: (taskItemId, annotationId, status) => {
      dispatch(
        persistAnnotation({
          id: annotationId,
          taskItemId,
          status: status ? Annotation.STATUS.DONE : Annotation.STATUS.NOT_DONE
        })
      );
    }
  };
};

const bindings = {
  onSetAsDone: "enter"
};
const AnnotationLabelStatusContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(hotkeys(bindings)(AnnotationLabelStatus));
export default AnnotationLabelStatusContainer;
