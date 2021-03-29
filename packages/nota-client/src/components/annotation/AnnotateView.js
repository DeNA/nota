import React from "react";
import AnnotatePreview from "./containers/AnnotatePreviewContainer";
import AnnotationLabelViewContainer from "./containers/AnnotationLabelViewContainer";
import ImageStatusContainer from "./containers/ImageStatusContainer";
import VideoControlsProvider from "./videoControls";

const AnnotateView = ({
  annotationPaneWidth,
  annotationLabelsPaneWidth,
  isDirty
}) => {
  const handleUnload = event => {
    if (isDirty) {
      event.preventDefault();
      event.returnValue = `There are unsaved changes. Are you sure you want to leave?`;
    }
  };
  React.useEffect(() => {
    window.addEventListener("beforeunload", handleUnload);

    return () => window.removeEventListener("beforeunload", handleUnload);
  });

  return (
    <VideoControlsProvider>
      <div className="annotate-view">
        <div
          className="annotation-preview-container"
          style={{ width: `${annotationPaneWidth}%` }}
        >
          <AnnotatePreview />
        </div>
        <div
          className="annotation-label-list-container"
          style={{ width: `${annotationLabelsPaneWidth}%` }}
        >
          <AnnotationLabelViewContainer />
          <ImageStatusContainer />
        </div>
      </div>
    </VideoControlsProvider>
  );
};

export default AnnotateView;
