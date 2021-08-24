import React, { useContext, useRef } from "react";
import "./AnnotatedVideo.css";
import AnnotatedVideoSeekbar from "./AnnotatedVideoSeekbar";
import { videoControlsContext } from "./videoControls";
import VideoTimelineVisualizationsContainer from "./containers/VideoTimelineVisualizationsContainer";

const AnnotatedVideo = function({
  videoUri,
  framerate,
  events,
  selectedAnnotationId,
  selectAnnotation,
  onNextFrame,
  onPreviousFrame,
  onNextFrame5,
  onPreviousFrame5,
  onNextFrame10,
  onPreviousFrame10,
  onTogglePlay
}) {
  const {
    videoStatus: { duration, currentTime, playing },
    videoControls: { skipFrames, togglePlay, setTime },
    setVideo,
    timeUpdate
  } = useContext(videoControlsContext);
  const video = useRef();

  const handleVideoReady = function() {
    setVideo([video, framerate]);
  };

  if (!videoUri) {
    return null;
  }

  return (
    <>
      <div className="annotated-video" onFocus={evt => evt.target.blur()}>
        <div className="spacer" />
        <div className="annotated-video-container">
          <video
            key={videoUri}
            className="annotated-video-video"
            ref={video}
            muted
            style={{ display: "auto" }}
            preload="auto"
            controls
            controlsList="nodownload" // prevent download icon in controls list
            onContextMenu={e => e.preventDefault()} // prevent context menu
            onLoadedMetadata={handleVideoReady}
            onTimeUpdate={timeUpdate}
          >
            <source src={videoUri} type="video/mp4" />
          </video>
        </div>
        <AnnotatedVideoSeekbar
          key={videoUri}
          duration={duration}
          currentTime={currentTime}
          playing={playing}
          togglePlay={togglePlay}
          setTime={setTime}
          events={events}
          selectedAnnotationId={selectedAnnotationId}
          selectAnnotation={selectAnnotation}
          skipFrames={skipFrames}
          onNextFrame={onNextFrame}
          onPreviousFrame={onPreviousFrame}
          onNextFrame5={onNextFrame5}
          onPreviousFrame5={onPreviousFrame5}
          onNextFrame10={onNextFrame10}
          onPreviousFrame10={onPreviousFrame10}
          onTogglePlay={onTogglePlay}
        />
        <VideoTimelineVisualizationsContainer />
      </div>
    </>
  );
};

export default AnnotatedVideo;
