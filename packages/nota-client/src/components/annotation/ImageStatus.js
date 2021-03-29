import React from "react";
import { Checkbox, Button } from "./semantic";

const ImageStatus = ({
  done,
  imageId,
  canBeSetAsDone,
  hasAnnotations,
  editable,
  onDoneChange,
  onSetAsDone
}) => {
  onSetAsDone(
    evt =>
      editable &&
      imageId !== null &&
      !done &&
      canBeSetAsDone &&
      onDoneChange(imageId, true) &&
      false
  );
  const renderButton = () => {
    return (
      <Button
        content="Complete IMAGE (↵)"
        inverted
        fluid
        color="blue"
        disabled={!editable}
        onClick={evt => onDoneChange(imageId, true)}
      />
    );
  };
  const renderToggle = () => {
    return (
      <Checkbox
        toggle
        label="Complete IMAGE"
        disabled={!editable}
        checked
        onChange={evt => onDoneChange(imageId, false)}
      />
    );
  };
  return (
    <div className="image-status">
      <div className="done-button">
        {imageId !== null && canBeSetAsDone
          ? done
            ? renderToggle()
            : renderButton()
          : ""}
      </div>
    </div>
  );
};

export default ImageStatus;
