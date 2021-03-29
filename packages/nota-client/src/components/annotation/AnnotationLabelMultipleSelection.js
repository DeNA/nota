import React from "react";
import AnnotationLabel from "./AnnotationLabel";
import MultipleSelectionRadio from "./MultipleSelectionRadio";

/**
 * @param {{label: Nota.LabelMultipleSelection, value?: string, editable: boolean, onChange: any}} props
 */
const AnnotationLabelMultipleSelection = props => {
  const { label, value, editable, onChange } = props;

  const renderContents = () => {
    return (
      <MultipleSelectionRadio
        items={label.options.items}
        name={label.name}
        value={value}
        editable={editable}
        onChange={value => onChange(value)}
      />
    );
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

export default AnnotationLabelMultipleSelection;
