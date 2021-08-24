import React from "react";
import { useTranslation } from "react-i18next";

const AnnotationLabel = ({
  label,
  contents,
  headerContents = "",
  required,
  hasValue,
  height = undefined,
  expands = false
}) => {
  const { t } = useTranslation();
  const style = {};

  if (height) {
    style.height = height;
  }
  return (
    <div className={`label ${expands ? "expands" : ""}`}>
      <div className="header">
        <div className="title">{label}</div>{" "}
        <small className="required">
          <em>{required && t("required")}</em>
        </small>
        <div className="header-contents">{headerContents || ""}</div>
      </div>
      <div className="contents" style={style}>
        {contents}
      </div>
    </div>
  );
};

export default AnnotationLabel;
