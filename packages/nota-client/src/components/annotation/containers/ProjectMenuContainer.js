import { connect } from "react-redux";
import { setOptions } from "../../../actions";
import { selector } from "../../../lib/selector";
import { closeTask } from "../../../state/task";
import ProjectMenu from "../ProjectMenu";

const mapStateToProps = state => {
  const db = selector(state);

  return {
    project: state.taskAssignment.data.project.name,
    task: state.taskAssignment.data.task.name,
    manualUrl: state.taskAssignment.data.manualUrl,
    options: state.options,
    taskItemId: state.selectedImageId,
    totalItems: state.imageList.length,
    completeItems: db.select("doneImages").length
  };
};

const mapDispatchToProps = dispatch => {
  return {
    changeOptions: options => {
      dispatch(setOptions(options));
    },
    closeTask: taskItemId => {
      dispatch(closeTask());
    }
  };
};

const PreviewContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectMenu);
export default PreviewContainer;
