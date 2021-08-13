import React, { useContext, useState } from "react";
import { Crosshair, LineSeries, XYPlot } from "react-vis";
import "react-vis/dist/style.css";
import { videoControlsContext } from "./videoControls";

const DUMMY_PREDICTION = {
  prediction_1: {
    label: "予測A",
    min: 0,
    max: 1,
    default: 0,
    color: "red",
    values: [
      [0, 0],
      [1000, 0.5],
      [1100, 1],
      [3200, 1],
      [5300, 0.5],
      [15000, 0.5],
      [15100, 1],
      [16200, 1],
      [16300, 0.5],
      [25000, 0]
    ]
  },
  prediction_2: {
    label: "予測B",
    min: 0,
    max: 1,
    default: 0,
    color: "blue",
    values: [
      [0, 0],
      [3000, 0.5],
      [3100, 1],
      [3200, 1],
      [3300, 0.5],
      [4300, 0],
      [8000, 0.5],
      [8100, 1],
      [8200, 1],
      [8300, 0.5],
      [8301, 0],
      [25000, 0]
    ]
  }
};

function VideoPredictionTimeline() {
  const [tooltip, setTooltip] = useState(null);
  const {
    videoControls: { setTime }
  } = useContext(videoControlsContext);

  const lines = Object.entries(DUMMY_PREDICTION).map(([key, prediction]) => {
    return {
      id: key,
      label: prediction.label,
      color: prediction.color,
      data: prediction.values.map(([time, value]) => {
        return {
          x: time,
          y: value
        };
      })
    };
  });

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

  return (
    <div style={{ backgroundColor: "rgba(255,255,255,0.9)" }}>
      <XYPlot
        width={1055}
        height={100}
        margin={{ left: 3, right: 3, top: 5, bottom: 5 }}
        xDomain={[0, 25000]}
        yDomain={[0, 1]}
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
            console.log(values);
            return {
              title: "ms",
              value: values[0].x
            };
          }}
        />
      </XYPlot>
    </div>
  );
}

export default VideoPredictionTimeline;
