import React, { useState } from "react";

export const videoControlsContext = React.createContext({
  videoControls: null,
  videoStatus: null,
  setVideo: video => {},
  timeUpdate: () => {}
});

const VideoControlsProvider = function({ children }) {
  const [state, setState] = useState({
    duration: 0,
    currentTime: 0,
    playing: false,
    framerate: 0,
    video: null
  });
  const { duration, currentTime, playing, framerate, video } = state;

  const onSetVideo = function([video, framerate = 0]) {
    setState({
      duration: video.current.duration,
      currentTime: 0,
      playing: false,
      framerate,
      video
    });
  };

  const onTimeUpdate = function() {
    setState({ ...state, currentTime: video.current.currentTime });
  };

  const skipFrames = function(frames) {
    if (!video || !video.current) return;

    video.current.pause();
    setState({ ...state, playing: false });
    const currentFrame = Math.ceil(video.current.currentTime * framerate);
    video.current.currentTime = Math.min(
      (currentFrame + frames) / framerate,
      video.current.duration
    );
  };

  const togglePlay = function() {
    if (!video || !video.current) return;

    if (playing) {
      video.current.pause();
      setState({ ...state, playing: false });
    } else {
      video.current.play();
      setState({ ...state, playing: true });
    }
  };

  const getTime = function() {
    if (!video || !video.current) return 0;

    video.current.pause();
    setState({ ...state, playing: false });

    return Math.round(video.current.currentTime * 1000);
  };

  const setTime = function(timestamp, forcePlay = false) {
    if (!video || !video.current) return;
    const newTime = Math.min(timestamp / 1000, video.current.duration);

    if (!forcePlay) {
      video.current.pause();
      setState({ ...state, currentTime: newTime, playing: false });
    } else {
      video.current.play();
      setState({ ...state, currentTime: newTime, playing: true });
    }

    try {
      video.current.currentTime = newTime;
    } catch (error) {
      console.error(error);
    }
  };

  const getFrame = function() {
    if (!video || !video.current || video.current.currentTime === 0) return 0;

    return Math.ceil(video.current.currentTime * framerate);
  };

  const getDuration = function() {
    if (!video || !video.current) return 0;

    return Math.ceil(video.current.duration * 1000);
  };

  return (
    <videoControlsContext.Provider
      value={{
        videoStatus: {
          duration,
          currentTime,
          playing
        },
        videoControls: {
          skipFrames,
          togglePlay,
          getTime,
          setTime,
          getFrame,
          getDuration
        },
        setVideo: onSetVideo,
        timeUpdate: onTimeUpdate
      }}
    >
      {children}
    </videoControlsContext.Provider>
  );
};

export default VideoControlsProvider;
