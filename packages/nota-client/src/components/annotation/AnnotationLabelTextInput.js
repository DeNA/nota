import React from "react";
import { validateTextInputLabel } from "../../lib/annotationUtils";
import AnnotationLabel from "./AnnotationLabel";

/**
 * @param {{label: Nota.LabelTextInput, value?: string, editable: boolean, onChange: any}} props
 */
const AnnotationLabelTextInput = props => {
  const { label, value, editable, onChange } = props;

  const renderContents = () => {
    if (!editable) {
      return <div>{value}</div>;
    }
    return (
      <div>
        <div>{label.options.description}</div>
        <input
          type="text"
          onChange={({ target }) => {
            if (validateTextInputLabel(label, target.value)) {
              onChange(target.value);
            }
          }}
          value={value || ""}
        />
      </div>
    );
  };

  return (
    <AnnotationLabel
      label={label.label}
      contents={renderContents()}
      required={label.options.required}
      hasValue={value !== undefined}
    />
  );
};

export default AnnotationLabelTextInput;
