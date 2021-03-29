import React from "react";
import AnnotationLabel from "./AnnotationLabel";
import InputCheckbox from "./InputCheckbox";

/**
 * @param {{label: Nota.LabelBoolean, value?: boolean, editable: boolean, onChange: any}} props
 */
const AnnotationLabelBoolean = props => {
  const { label, value, editable, onChange } = props;

  /** @type {Nota.OptionItem} */
  const item = {
    label: "",
    value: label.name
  };

  const renderContents = () => {
    switch (label.options.display) {
      case "CHECKBOX":
        return (
          <InputCheckbox
            item={item}
            checked={!!value}
            editable={editable}
            onChange={value => onChange(value)}
          />
        );
      default:
        return <div>Not Implemented</div>;
    }
  };

  const hotkey =
    label.hotkey && label.hotkey.length ? ` (${label.hotkey})` : "";
  return (
    <AnnotationLabel
      label={label.label + hotkey}
      contents={renderContents()}
      required={label.options.required}
      hasValue={value !== undefined}
    />
  );
};

export default AnnotationLabelBoolean;
