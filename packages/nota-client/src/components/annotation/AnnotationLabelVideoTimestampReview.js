import React, { useContext } from "react";
import { Button } from "react-bootstrap";
import { videoControlsContext } from "./videoControls";

const AnnotationLabelVideoTimestampReview = props => {
  const {
    videoControls: { setTime }
  } = useContext(videoControlsContext);
  const { label, value } = props;
  const hasValue = value !== undefined;

  const handleGoToTime = function(evt) {
    evt.target.blur();
    setTime(value);
  };

  return hasValue ? (
    <Button
      block
      variant="link"
      className="p-0 m-0 text-left text-decoration-none text-light"
      onClick={handleGoToTime}
    >
      <small className="text-truncate mr-1">
        {label.label}({(value / 1000).toFixed(2)}s)
      </small>
    </Button>
  ) : (
    <div>{label.label}: --</div>
  );
};

export default AnnotationLabelVideoTimestampReview;
