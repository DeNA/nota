import { connect } from "react-redux";
import { setOptions } from "../../../actions";
import { ALL_PRESET, CUSTOM_PRESET } from "../../../constants";
import { selector } from "../../../lib/selector";
import VideoTimelineVisualizations from "../VideoTimelineVisualizations";

const mapStateToProps = state => {
  const db = selector(state);
  const { timelineVis = [], timelineVisPresets = [] } = db.select(
    "folderTemplateMediaOptions"
  );
  const min = Math.min(0, ...timelineVis.map(vis => vis.min ?? 0));
  const max = Math.max(1, ...timelineVis.map(vis => vis.max ?? 1));
  const templateId = state.taskAssignment?.data?.task?.taskTemplate?.id;
  const timelineVisState = state.options.timelineVisState[templateId];
  const selectedPresetId = timelineVisState?.preset ?? ALL_PRESET;
  const selectedVis = timelineVisState?.vis ?? [];
  const showVisPresets = [...timelineVisPresets];

  showVisPresets.unshift(
    {
      id: CUSTOM_PRESET,
      label: "",
      vis: selectedPresetId === CUSTOM_PRESET ? selectedVis : [],
      disabled: true
    },
    { id: ALL_PRESET, label: "All", vis: timelineVis.map(vis => vis.id) }
  );
  // Default to ALL_PRESET if not found
  const selectedPreset =
    showVisPresets.find(preset => preset.id === selectedPresetId) ??
    timelineVisPresets[1];

  return {
    min,
    max,
    timelineVis,
    timelineVisPresets: showVisPresets,
    selectedPreset,
    projectId: state.taskAssignment?.data?.project?.id,
    taskId: state.taskAssignment?.data?.task?.id,
    templateId,
    taskItemId: state.selectedImageId
  };
};

const mapDispatchToProps = dispatch => {
  return {
    changeTimelineVisState: (templateId, preset, vis) => {
      dispatch(
        setOptions({ timelineVisState: { [templateId]: { preset, vis } } })
      );
    }
  };
};

const VideoTimelineVisualizationsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(VideoTimelineVisualizations);
export default VideoTimelineVisualizationsContainer;
