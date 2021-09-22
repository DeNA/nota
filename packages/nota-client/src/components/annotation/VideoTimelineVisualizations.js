import React, { useContext, useEffect, useState } from "react";
import useDimensions from "react-cool-dimensions";
import { useTranslation } from "react-i18next";
import { AreaSeries, Crosshair, LineSeries, XYPlot } from "react-vis";
import "react-vis/dist/style.css";
import { getVis } from "../../lib/binaryVis";
import Loading from "../Loading";
import { videoControlsContext } from "./videoControls";
import "./VideoTimelineVisualizations.css";

const DEFAULT_COLOR = "red";
const VISUALIZATION_TYPE = {
  LINE: "line",
  BACKGROUND_AREA: "backgroundArea"
};
const DEFAULT_VISUALIZATION_TYPE = VISUALIZATION_TYPE.LINE;

function VideoTimelineVisualizations({
  projectId,
  taskId,
  taskItemId,
  timelineVis = [],
  min,
  max
}) {
  const { t } = useTranslation();
  const hasVis = timelineVis.length > 0;
  const { observe, width, height } = useDimensions();
  const [tooltip, setTooltip] = useState(null);
  const [visualizations, setVisualizations] = useState({});
  const [loading, setLoading] = useState(false);
  const {
    videoControls: { setTime, getDuration },
    videoStatus: { currentTime }
  } = useContext(videoControlsContext);

  useEffect(() => {
    if (hasVis && projectId && taskId && taskItemId) {
      setLoading(true);
      getVis(projectId, taskId, taskItemId)
        .then(visualizations => {
          setVisualizations(visualizations);
        })
        .catch(error => {
          console.log(error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [hasVis, projectId, taskId, taskItemId]);

  const lines = timelineVis
    .map(visOptions => {
      const vis = visualizations[visOptions.id];

      return vis
        ? {
            id: visOptions.id,
            type: visOptions.type || DEFAULT_VISUALIZATION_TYPE,
            label: vis.label || visOptions.label || visOptions.id,
            color: vis.color || visOptions.color || DEFAULT_COLOR,
            data: vis.values.map(([time, value]) => {
              return visOptions.type === VISUALIZATION_TYPE.BACKGROUND_AREA
                ? {
                    s: time,
                    e: value,
                    data: [
                      { x: time, y: min },
                      { x: time, y: max },
                      { x: value, y: max },
                      { x: value, y: min }
                    ]
                  }
                : {
                    x: time,
                    y: value
                  };
            })
          }
        : null;
    })
    .filter(line => line !== null)
    .sort(a => (a.type === VISUALIZATION_TYPE.BACKGROUND_AREA ? -1 : 1));

  const handleOnNearestX = function({ x, y }, { index }) {
    const tooltip = lines
      .map(line => {
        if (line.type === VISUALIZATION_TYPE.BACKGROUND_AREA) {
          return line.data.some(area => area.s <= x && area.e >= x)
            ? {
                label: line.label,
                id: line.id,
                y: "true",
                x
              }
            : null;
        }

        const found = line.data.find(data => data.x === x);

        return found
          ? {
              label: line.label,
              id: line.id,
              y: found.y,
              x: found.x
            }
          : null;
      })
      .filter(data => data !== null);

    setTooltip(tooltip);
  };

  const handleOnClick = function() {
    if (tooltip?.[0]?.x) {
      setTime(tooltip[0].x);
    }
  };

  const handleMouseLeave = function() {
    setTooltip(null);
  };

  if (!hasVis) {
    return null;
  }

  const showGraph = !loading && lines.length > 0;
  const progressPosition = ((width - 6) / getDuration()) * currentTime * 1000;

  return (
    <div
      ref={observe}
      className="vis-container"
      onMouseLeave={handleMouseLeave}
    >
      <Loading loading={loading} />
      {showGraph ? (
        <div className="timeline-chart" data-testid="timeline-chart">
          <div
            className="timeline-progress"
            style={{
              left: isNaN(progressPosition) ? -1 : progressPosition + 1
            }}
          />
          <XYPlot
            width={width}
            height={height}
            margin={{ left: 3, right: 3, top: 5, bottom: 5 }}
            xDomain={[0, getDuration()]}
            yDomain={[min, max]}
            onClick={handleOnClick}
          >
            {lines.map(line =>
              line.type === VISUALIZATION_TYPE.BACKGROUND_AREA ? (
                line.data.map(area => (
                  <AreaSeries
                    key={`${line.id}_${area.s}_${area.e}`}
                    className={line.id}
                    color={line.color}
                    data={area.data}
                  />
                ))
              ) : (
                <LineSeries
                  key={line.id}
                  className={line.id}
                  color={line.color}
                  data={line.data}
                  onNearestX={handleOnNearestX}
                />
              )
            )}
            <Crosshair
              values={tooltip}
              itemsFormat={values => {
                return values.map(d => ({
                  title: d.label,
                  value: d.y
                }));
              }}
              titleFormat={values => {
                return {
                  title: "ms",
                  value: values[0].x
                };
              }}
            />
          </XYPlot>
        </div>
      ) : (
        <div>{t("vis-not-found")}</div>
      )}
    </div>
  );
}

export default VideoTimelineVisualizations;
