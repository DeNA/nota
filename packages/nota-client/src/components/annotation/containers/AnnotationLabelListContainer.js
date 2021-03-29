import { connect } from "react-redux";
import AnnotationLabelList from "../AnnotationLabelList";
import hotkeys from "../../../lib/Hotkeys";
import { selector } from "../../../lib/selector";
import { updateAnnotationLocal } from "../../../state/annotation";

/**
 * @param {Nota.Label[]} labels
 */
const bindingsMap = labels => {
  return labels.reduce((bindings, label) => {
    if (label.hotkey !== undefined && label.hotkey.length) {
      bindings[`hk_${label.name}`] = label.hotkey;
    }
    if (label.options.items && label.options.items.length) {
      label.options.items.reduce((bindings, item) => {
        if (item.hotkey !== undefined && item.hotkey.length) {
          bindings[`hk_${label.name}_${item.value}`] = item.hotkey;
        }
        return bindings;
      }, bindings);
    }
    return bindings;
  }, {});
};

const mapStateToProps = state => {
  const db = selector(state);

  return {
    labels: db.select("annotationFields"),
    values: db.select("annotationValues"),
    annotationId: state.selectedAnnotationId,
    imageUri: db.select("imageUri"),
    imageFilters: state.imageFilters,
    options: state.options,
    boundaries: db.select("annotationBoundaries"),
    hkbindings: bindingsMap(db.select("annotationFields")),
    editable: state.editable && !db.select("annotationDone"),
    focus: db.select("annotationLabelFocus")
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onChange: (annotationId, labels) => {
      dispatch(updateAnnotationLocal({ labels, id: annotationId }));
    }
  };
};

const AnnotationLabelListContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(hotkeys()(AnnotationLabelList));
export default AnnotationLabelListContainer;
