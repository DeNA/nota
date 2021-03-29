import React from "react";

const AnnotationLabel = ({
  label,
  contents,
  headerContents = "",
  required,
  hasValue,
  height = undefined,
  expands = false
}) => {
  const style = {};

  if (height) {
    style.height = height;
  }
  return (
    <div className={`label ${expands ? "expands" : ""}`}>
      <div className="header">
        <div className="title">{label}</div>{" "}
        <small className="required">
          <em>{required && "(Required)"}</em>
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
