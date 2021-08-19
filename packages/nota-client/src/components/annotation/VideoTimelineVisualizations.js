import React, { useContext, useEffect, useState } from "react";
import useDimensions from "react-cool-dimensions";
import { useTranslation } from "react-i18next";
import { Crosshair, LineSeries, XYPlot } from "react-vis";
import "react-vis/dist/style.css";
import { getVis } from "../../lib/binaryVis";
import Loading from "../Loading";
import { videoControlsContext } from "./videoControls";
import "./VideoTimelineVisualizations.css";

const DEFAULT_COLOR = "red";

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
    videoControls: { setTime, getDuration }
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
            label: vis.label || visOptions.label || visOptions.id,
            color: vis.color || visOptions.color || DEFAULT_COLOR,
            data: vis.values.map(([time, value]) => {
              return {
                x: time,
                y: value
              };
            })
          }
        : null;
    })
    .filter(line => line !== null);

  const handleOnNearestX = function({ x, y }, { index }) {
    const tooltip = lines
      .map(line => {
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

  if (!hasVis) {
    return null;
  }

  const showGraph = !loading && lines.length > 0;

  return (
    <div ref={observe} className="vis-container">
      <Loading loading={loading} />
      {showGraph ? (
        <div className="timeline-chart" data-testid="timeline-chart">
          <XYPlot
            width={width}
            height={height}
            margin={{ left: 3, right: 3, top: 5, bottom: 5 }}
            xDomain={[0, getDuration()]}
            yDomain={[min, max]}
            onClick={handleOnClick}
          >
            {lines.map((line, i) => (
              <LineSeries
                key={line.id}
                className={line.id}
                color={line.color}
                data={line.data}
                onNearestX={i === 0 ? handleOnNearestX : null}
              />
            ))}
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
