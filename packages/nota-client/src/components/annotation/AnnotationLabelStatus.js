import React from "react";
import { useTranslation } from "react-i18next";
import { Checkbox, Button } from "./semantic";

const AnnotationLabelStatus = ({
  done,
  imageDone,
  annotationId,
  editable,
  onDoneChange,
  onSetAsDone,
  canBeSetAsDone,
  taskItemId
}) => {
  const { t } = useTranslation();
  onSetAsDone(evt => {
    if (editable && annotationId !== null && !done && canBeSetAsDone) {
      onDoneChange(taskItemId, annotationId, true);
      return false;
    }
  });
  const renderButton = () => {
    return (
      <Button
        fluid
        inverted
        content={t("complete-annotation")}
        color="olive"
        disabled={!editable}
        onClick={evt => onDoneChange(taskItemId, annotationId, true)}
      />
    );
  };
  const renderToggle = () => {
    return (
      <Checkbox
        toggle
        label={t("complete-annotation-1")}
        checked
        disabled={!editable}
        onChange={evt => onDoneChange(taskItemId, annotationId, false)}
      />
    );
  };
  return (
    <div className="annotation-label-status">
      {annotationId !== null && !imageDone
        ? done
          ? renderToggle()
          : canBeSetAsDone
          ? renderButton()
          : ""
        : ""}
    </div>
  );
};

export default AnnotationLabelStatus;
