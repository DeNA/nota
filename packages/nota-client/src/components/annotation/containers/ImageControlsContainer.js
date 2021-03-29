import { connect } from "react-redux";
import ImageControls from "../ImageControls";
import { changeAddAnnotation } from "../../../actions";
import hotkeys from "../../../lib/Hotkeys";
import { selector } from "../../../lib/selector";
import { resetTaskItemActions } from "../../../state/taskItem";
import { createAnnotationLocal } from "../../../state/annotation";

const bindingsMap = annotationTemplates => {
  return annotationTemplates.reduce((bindings, template) => {
    if (
      template.hotkey &&
      (!template.options || !template.options.autoCreate)
    ) {
      bindings[`hk_addAnnotation_${template.name}`] = template.hotkey;
    }

    return bindings;
  }, {});
};

const mapStateToProps = state => {
  const db = selector(state);
  const annotationFields = db.select("folderTemplateAnnotations");

  return {
    editable: state.editable,
    annotationTemplates: annotationFields,
    done: db.select("imageDone"),
    hkbindings: bindingsMap(annotationFields),
    imageId: state.selectedImageId,
    hasAnnotations: db.select("imageAnnotations").length ? true : false,
    addAnnotation: state.addAnnotation
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onClearAnnotations: taskItemId => {
      dispatch(resetTaskItemActions.action({ taskItemId }));
    },
    toggleAddAnnotation: addAnnotation => {
      dispatch(changeAddAnnotation(addAnnotation));
    },
    createAnnotation: (taskItemId, labelsName, mediaDefaults) => {
      dispatch(
        createAnnotationLocal({ taskItemId }, labelsName, mediaDefaults)
      );
    }
  };
};

const ImageControlsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(hotkeys()(ImageControls));
export default ImageControlsContainer;
