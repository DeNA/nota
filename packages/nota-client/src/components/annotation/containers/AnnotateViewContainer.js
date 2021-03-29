import { connect } from "react-redux";
import AnnotateView from "../AnnotateView";
import { selector } from "../../../lib/selector";

const mapStateToProps = state => {
  const db = selector(state);
  const templateOptions = db.select("folderTemplateOptions");
  const annotationPaneWidth = Math.min(
    0.9,
    parseFloat(templateOptions.annotationPaneWidth || 0.5) || 0.5
  );

  return {
    annotationPaneWidth: annotationPaneWidth * 100,
    annotationLabelsPaneWidth: (1 - annotationPaneWidth) * 100,
    isDirty: db.select("dirtyAnnotations").length > 0
  };
};

export default connect(mapStateToProps)(AnnotateView);
