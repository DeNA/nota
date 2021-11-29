import React, { useEffect, useRef, useState } from "react";
import { Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Icon from "../Icon";
import "./AnnotatedVideo.css";

const TIMELINE_ZOOM_MIN = 1;
const TIMELINE_ZOOM_MAX = 5;

const calculateTime = function(duration, currentTime) {
  const length = duration.toFixed(2);
  const current = currentTime.toFixed(2);

  return `${current}/${length}s`;
};

const getPauseTimes = function(events, duration) {
  const pauseTimes = [[duration * 1000, null]];

  for (const event of events) {
    if (event.start) {
      pauseTimes.push([event.start, event, "start"]);
    }

    if (event.end) {
      pauseTimes.push([event.end, event, "end"]);
    }
  }

  return pauseTimes.sort((a, b) => a[0] - b[0]);
};

const AnnotatedVideoSeekbar = function({
  duration,
  currentTime,
  playing,
  setTime,
  togglePlay,
  events,
  selectedAnnotationId,
  selectAnnotation,
  timelineZoom,
  changeTimelineZoom,
  skipFrames,
  onNextFrame,
  onPreviousFrame,
  onNextFrame5,
  onPreviousFrame5,
  onNextFrame10,
  onPreviousFrame10,
  onTogglePlay
}) {
  const { t } = useTranslation();
  const [seeking, setSeeking] = useState(false);
  const [playUntil, setPlayUntil] = useState(+Infinity);
  const annotatedEventsPosition = useRef();
  const progressContainer = useRef();
  const annotatedEventsContainer = useRef();
  const progress = duration ? (currentTime / duration) * 100 : 0;
  const time = duration ? calculateTime(duration, currentTime) : "--:--";

  const handleProgressbarMouseDown = function(evt) {
    if (!duration) return;
    evt.preventDefault();

    setSeeking(true);
    setPlayUntil(+Infinity);

    const rect = evt.target.getBoundingClientRect();
    const x = evt.clientX - rect.left; //x position within the element
    const width = rect.right - rect.left;
    const newProgress = x / width;

    setTime(duration * newProgress * 1000);
  };

  useEffect(() => {
    const handleMouseMove = function(evt) {
      if (!duration || !seeking || !progressContainer.current) return;

      const rect = progressContainer.current.getBoundingClientRect();
      const x = evt.clientX - rect.left; //x position within the element
      const width = rect.right - rect.left;
      const newProgress = x / width;

      setTime(duration * newProgress * 1000);
    };

    const handleMouseUp = function(evt) {
      if (!duration || !seeking || !progressContainer.current) return;
      setSeeking(false);

      const rect = progressContainer.current.getBoundingClientRect();
      const x = evt.clientX - rect.left; //x position within the element
      const width = rect.right - rect.left;
      const newProgress = x / width;

      setTime(duration * newProgress * 1000);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return function() {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [duration, seeking, setTime]);

  useEffect(() => {
    if (playUntil && currentTime >= playUntil / 1000) {
      setTime(playUntil);
    }

    if (timelineZoom > TIMELINE_ZOOM_MIN && annotatedEventsPosition.current) {
      // Use timeout to scroll after new position is rendered
      setTimeout(() => {
        annotatedEventsPosition.current.scrollIntoView({
          inline: "center",
          behavior: "smooth"
        });
      }, 20);
    }
  }, [playUntil, currentTime, timelineZoom]);

  const handleEventSelection = function(event) {
    selectAnnotation(event.annotation.id);
    setPlayUntil(event.end);
    setTime(event.start, true);
  };

  const handleEventStartSelection = function(event) {
    selectAnnotation(event.annotation.id);
    setPlayUntil(event.end);
    setTime(event.start);
  };

  const handleEventEndSelection = function(event) {
    selectAnnotation(event.annotation.id);
    setPlayUntil(event.end);
    setTime(event.end);
  };

  const handlePlay = function() {
    setPlayUntil(+Infinity);
    togglePlay();
  };

  const handleSkip = function(frames) {
    setPlayUntil(+Infinity);
    skipFrames(frames);
  };

  const handlePlayUntil = function() {
    if (!playing) {
      const timestamp = currentTime >= duration ? 0 : currentTime * 1000;
      const pauseTimes = getPauseTimes(events, duration);
      const [nextPauseTime, nextPauseEvent, type] = pauseTimes.find(
        ([pause]) => pause > timestamp
      );

      setPlayUntil(nextPauseTime);
      if (nextPauseEvent) {
        if (type === "end") {
          selectAnnotation(nextPauseEvent.annotation.id);
        } else {
          selectAnnotation(null);
        }
      } else {
        selectAnnotation(null);
      }

      if (timestamp === 0) {
        setTime(0, true);
      } else {
        togglePlay();
      }
    } else {
      setPlayUntil(+Infinity);
      togglePlay();
    }
  };

  const handleBlankClick = function(evt) {
    if (!duration || !annotatedEventsContainer.current) return;

    const rect = annotatedEventsContainer.current.getBoundingClientRect();
    const x = evt.clientX - rect.left; //x position within the element
    const width = rect.right - rect.left;
    const progress = x / width;
    const time = duration * progress * 1000;

    const pauseTimes = getPauseTimes(events, duration);
    const nextIndex = pauseTimes.findIndex(([pause]) => pause > time);
    const [prevPauseTime] = pauseTimes[nextIndex - 1] || [0];
    const [nextPauseTime] = pauseTimes[nextIndex] || [duration * 1000];

    setPlayUntil(nextPauseTime);
    selectAnnotation(null);
    setTime(prevPauseTime, true);
  };

  const handleZoomOut = function() {
    changeTimelineZoom(Math.max(TIMELINE_ZOOM_MIN, timelineZoom - 1));
  };
  const handleZoomIn = function() {
    changeTimelineZoom(Math.min(TIMELINE_ZOOM_MAX, timelineZoom + 1));
  };

  onNextFrame(evt => handleSkip(1));
  onNextFrame5(evt => handleSkip(5));
  onNextFrame10(evt => handleSkip(10));
  onPreviousFrame(evt => handleSkip(-1));
  onPreviousFrame5(evt => handleSkip(-5));
  onPreviousFrame10(evt => handleSkip(-10));
  onTogglePlay(evt => handlePlay());

  return (
    <>
      <div className="annotated-seekbar-controls">
        <div className="controls-container">
          <Button
            variant="light"
            className="skip-button"
            size="sm"
            onClick={() => handleSkip(-10)}
          >
            <Icon name={`chevron-left`} />
            <Icon name={`chevron-left`} />
            <Icon name={`chevron-left`} />
          </Button>
          <Button
            variant="light"
            className="skip-button"
            size="sm"
            onClick={() => handleSkip(-5)}
          >
            <Icon name={`chevron-left`} />
            <Icon name={`chevron-left`} />
          </Button>
          <Button
            variant="light"
            className="skip-button"
            size="sm"
            onClick={() => handleSkip(-1)}
          >
            <Icon name={`chevron-left`} />
          </Button>
          <Button
            variant="light"
            className="play-button"
            size="sm"
            onClick={handlePlay}
          >
            <Icon name={playing ? `media-pause` : `media-play`} />{" "}
            {t("toggle-play")}
          </Button>
          <Button
            variant="light"
            className="skip-button"
            size="sm"
            onClick={() => handleSkip(1)}
          >
            <Icon name={`chevron-right`} />
          </Button>
          <Button
            variant="light"
            className="skip-button"
            size="sm"
            onClick={() => handleSkip(5)}
          >
            <Icon name={`chevron-right`} />
            <Icon name={`chevron-right`} />
          </Button>
          <Button
            variant="light"
            className="skip-button"
            size="sm"
            onClick={() => handleSkip(10)}
          >
            <Icon name={`chevron-right`} />
            <Icon name={`chevron-right`} />
            <Icon name={`chevron-right`} />
          </Button>
          <div className="zoom-controls">
            <Button
              variant="light"
              className="zoom-out-button"
              disabled={timelineZoom <= TIMELINE_ZOOM_MIN}
              size="sm"
              onClick={handleZoomOut}
            >
              <Icon name={`zoom-out`} />
            </Button>
            <Button
              variant="light"
              className="zoom-in-button"
              disabled={timelineZoom >= TIMELINE_ZOOM_MAX}
              size="sm"
              onClick={handleZoomIn}
            >
              <Icon name={`zoom-in`} />
            </Button>
            <span>{timelineZoom}x</span>
          </div>
        </div>
      </div>
      <div className="spacer" />
      <div className="annotated-seekbar-bar">
        <div className="controls-container">
          <Button
            variant="outline-light"
            className="play-button"
            size="sm"
            onClick={handlePlayUntil}
          >
            <Icon name={playing ? `media-pause` : `media-step-forward`} />
          </Button>
        </div>
        <div
          className="progress-container"
          ref={progressContainer}
          onMouseDown={handleProgressbarMouseDown}
        >
          <div className="progress" style={{ width: `${progress}%` }} />
        </div>
        <div className="time">{time}</div>
      </div>
      <div className="annotated-events-container">
        <div
          className="annotated-events-zoom"
          style={{ width: `${100 * timelineZoom}%` }}
        >
          <div
            className="annotated-events"
            ref={annotatedEventsContainer}
            onClick={handleBlankClick}
            onMouseDown={evt => evt.stopPropagation()}
          >
            {events.map(event => {
              const left = (event.start / (duration * 1000)) * 100;
              const right = 100 - (event.end / (duration * 1000)) * 100;
              const selected = event.annotation.id === selectedAnnotationId;

              return (
                <div
                  className={`event ${selected ? "selected" : ""}`}
                  key={event.annotation.id}
                  style={{
                    left: `${left}%`,
                    right: `${right}%`
                  }}
                  onMouseDown={evt => evt.stopPropagation()}
                >
                  <div
                    className="event-start"
                    style={{
                      backgroundColor: event.color
                    }}
                    onClick={evt => {
                      evt.stopPropagation();
                      handleEventStartSelection(event);
                    }}
                  />
                  <div
                    className="event-content"
                    style={{
                      backgroundColor: event.color
                    }}
                    onClick={evt => {
                      evt.stopPropagation();
                      handleEventSelection(event);
                    }}
                  />
                  <div
                    className="event-end"
                    style={{
                      backgroundColor: event.color
                    }}
                    onClick={evt => {
                      evt.stopPropagation();
                      handleEventEndSelection(event);
                    }}
                  />
                </div>
              );
            })}
            <div
              className="position"
              style={{
                left: progress < 50 ? `${progress}%` : undefined,
                right: progress >= 50 ? `${100 - progress}%` : undefined
              }}
              ref={annotatedEventsPosition}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default AnnotatedVideoSeekbar;
