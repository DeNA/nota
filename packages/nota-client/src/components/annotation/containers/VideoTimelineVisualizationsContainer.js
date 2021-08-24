import { connect } from "react-redux";
import { selector } from "../../../lib/selector";
import VideoTimelineVisualizations from "../VideoTimelineVisualizations";

const mapStateToProps = state => {
  const db = selector(state);
  const { timelineVis = [] } = db.select("folderTemplateMediaOptions");
  const min = Math.min(0, ...timelineVis.map(vis => vis.min ?? 0));
  const max = Math.max(1, ...timelineVis.map(vis => vis.max ?? 1));

  return {
    min,
    max,
    timelineVis: timelineVis,
    projectId: state.taskAssignment?.data?.project?.id,
    taskId: state.taskAssignment?.data?.task?.id,
    taskItemId: state.selectedImageId
  };
};

const VideoTimelineVisualizationsContainer = connect(mapStateToProps)(
  VideoTimelineVisualizations
);
export default VideoTimelineVisualizationsContainer;
