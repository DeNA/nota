import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import "semantic-ui-css/semantic.css";
import { selectImage } from "../../../actions";
import { fetchTaskAssignmentActions } from "../../../state/taskAssignment";
import Loading from "../../Loading";
import AnnotateViewContainer from "./AnnotateViewContainer";

const AnnotationMain = function({
  match,
  fetchTaskAssignment,
  setSeletedImageId,
  loading
}) {
  const { projectId, taskId, taskAssignmentId, taskItemId } = match.params;
  const fetcher = React.useRef(fetchTaskAssignment);
  const taskItemIdSelector = React.useRef(setSeletedImageId);
  React.useEffect(() => {
    taskItemIdSelector.current(parseInt(taskItemId));
  }, [taskItemId]);
  React.useEffect(() => {
    fetcher.current({ projectId, taskId, taskAssignmentId });
  }, [projectId, taskId, taskAssignmentId]);

  if (loading) {
    return <Loading />;
  }

  return <AnnotateViewContainer />;
};

const mapStateToProps = function(state) {
  return {
    loading: state.taskAssignment.loading
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    fetchTaskAssignment: ({ projectId, taskId, taskAssignmentId }) => {
      dispatch(
        fetchTaskAssignmentActions.action({
          projectId,
          taskId,
          taskAssignmentId
        })
      );
    },
    setSeletedImageId: imageId => {
      dispatch(selectImage(imageId));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(AnnotationMain));
