import { connect } from "react-redux";
import ImageStatus from "../ImageStatus";
import { IMAGE_STATUS_DONE, IMAGE_STATUS_ONGOING } from "../../../constants";
import { updateImageStatus } from "../../../actions";
import hotkeys from "../../../lib/Hotkeys";
import { selector } from "../../../lib/selector";
import { Annotation } from "../../../lib/models";

/**
 * @param {Nota.Annotation[]} annotations
 * @return {boolean}
 */
const canBeSetAsDone = annotations => {
  return annotations.reduce((complete, annotation) => {
    return complete ? annotation.status === Annotation.STATUS.DONE : false;
  }, true);
};

const mapStateToProps = state => {
  const db = selector(state);
  const annotations = db.select("imageAnnotations");

  return {
    editable: state.editable,
    done: db.select("imageDone"),
    canBeSetAsDone: db.select("imageDone") || canBeSetAsDone(annotations),
    imageId: state.selectedImageId,
    hasAnnotations: annotations.length ? true : false
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onDoneChange: (imageId, status) => {
      dispatch(
        updateImageStatus({
          id: imageId,
          status: status ? IMAGE_STATUS_DONE : IMAGE_STATUS_ONGOING
        })
      );
    }
  };
};

const bindings = {
  onSetAsDone: "enter"
};
const ImageStatusContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(hotkeys(bindings)(ImageStatus));
export default ImageStatusContainer;
