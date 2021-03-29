import { connect } from "react-redux";
import AnnotationLabelReview from "../AnnotationLabelReview";
import { selector } from "../../../lib/selector";

const mapStateToProps = (state, ownProps) => {
  const db = selector(state);
  const { annotationId } = ownProps;

  return {
    labels: db.select("annotationFields", annotationId),
    values: db.select("annotationValues", annotationId),
    annotationId: annotationId
  };
};

const AnnotationLabelReviewContainer = connect(mapStateToProps)(
  AnnotationLabelReview
);
export default AnnotationLabelReviewContainer;
