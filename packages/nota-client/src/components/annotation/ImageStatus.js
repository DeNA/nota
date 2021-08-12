import React from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
        content={t("complete-image")}
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
        label={t("complete-image-2")}
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
