import React from "react";
import AnnotationLabel from "./AnnotationLabel";
import InputRadio from "./InputRadio";
import InputDropdown from "./InputDropdown";
import InputImage from "./InputImage";

/**
 * @param {{label: Nota.LabelSingleSelection, value?: string, editable: boolean, onChange: any}} props
 */
const AnnotationLabelSingleSelection = props => {
  const { label, value, editable, onChange } = props;

  const renderContents = () => {
    switch (label.options.display) {
      case "RADIO":
        return (
          <InputRadio
            items={label.options.items}
            name={label.name}
            value={value}
            editable={editable}
            onChange={value => onChange(value)}
          />
        );
      case "DROPDOWN":
        return (
          <InputDropdown
            items={label.options.items}
            name={label.name}
            value={value}
            editable={editable}
            onChange={value => onChange(value)}
          />
        );
      case "IMAGE":
        return (
          <InputImage
            items={label.options.items}
            itemWidth={label.options.itemWidth || 70}
            value={value}
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

export default AnnotationLabelSingleSelection;
