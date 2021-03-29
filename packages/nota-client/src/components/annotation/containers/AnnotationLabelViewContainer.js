import { connect } from "react-redux";
import AnnotationLabelView from "../AnnotationLabelView";
import { selector } from "../../../lib/selector";

const mapStateToProps = state => {
  const db = selector(state);

  return {
    key: state.selectedAnnotationId,
    popup: db.select("annotationLabelPopup"),
    metadataFields: db.select("folderTemplateShownMetadataFields"),
    _force: Math.random()
  };
};

const AnnotationLabelViewContainer = connect(mapStateToProps)(
  AnnotationLabelView
);
export default AnnotationLabelViewContainer;
