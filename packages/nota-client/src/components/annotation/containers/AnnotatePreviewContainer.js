import { connect } from "react-redux";
import AnnotatePreview from "../AnnotatePreview";
import { selector } from "../../../lib/selector";

const mapStateToProps = state => {
  const db = selector(state);
  const mediaType = db.select("folderTemplate").mediaType || "IMAGE";

  return {
    mediaType
  };
};

const AnnotatePreviewContainer = connect(mapStateToProps)(AnnotatePreview);

export default AnnotatePreviewContainer;
