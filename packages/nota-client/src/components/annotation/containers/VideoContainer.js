import { connect } from "react-redux";
import { selectImageAnnotationByUser } from "../../../actions";
import { DEFAULT_ANNOTATION_COLOR } from "../../../constants";
import hotkeys from "../../../lib/Hotkeys";
import { selector } from "../../../lib/selector";
import { setOptions } from "../../../actions";
import AnnotatedVideo from "../AnnotatedVideo";

const getEventAnnotations = (annotations, template) => {
  const videoEventAnnotationTemplates = (template.annotations || []).filter(
    annotation =>
      annotation.options &&
      annotation.options.videoEvent &&
      annotation.options.videoEvent.start &&
      annotation.options.videoEvent.end
  );
  const eventAnnotations = [];

  for (const annotation of annotations) {
    const eventAnnotationTemplate = videoEventAnnotationTemplates.find(
      template => template.name === annotation.labelsName
    );

    if (!eventAnnotationTemplate) continue;

    eventAnnotations.push({
      annotation,
      color: eventAnnotationTemplate.options.color || DEFAULT_ANNOTATION_COLOR,
      start:
        annotation.labels[eventAnnotationTemplate.options.videoEvent.start] ||
        null,
      end:
        annotation.labels[eventAnnotationTemplate.options.videoEvent.end] ||
        null
    });
  }

  return eventAnnotations.sort((a, b) => a.start - b.start);
};

const mapStateToProps = state => {
  const db = selector(state);
  const mediaOptions = db.select("folderTemplate").mediaOptions || {};
  const template = db.select("folderTemplate");
  const annotations = db.select("imageAnnotations");

  return {
    videoUri: db.select("imageUri"),
    framerate: mediaOptions.framerate || 25,
    events: getEventAnnotations(annotations, template),
    selectedAnnotationId: state.selectedAnnotationId,
    options: state.options
  };
};

const mapDispatchToProps = dispatch => {
  return {
    selectAnnotation: annotationId => {
      dispatch(selectImageAnnotationByUser(annotationId));
    },
    changeOptions: options => {
      dispatch(setOptions(options));
    }
  };
};

const bindings = {
  onNextFrame: "shift+right",
  onNextFrame5: "shift+alt+right",
  onNextFrame10: ["shift+alt+down", "shift+down"],
  onPreviousFrame: "shift+left",
  onPreviousFrame5: "shift+alt+left",
  onPreviousFrame10: ["shift+alt+up", "shift+up"],
  onTogglePlay: "space"
};

const VideoContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(hotkeys(bindings, {}, true)(AnnotatedVideo));

export default VideoContainer;
