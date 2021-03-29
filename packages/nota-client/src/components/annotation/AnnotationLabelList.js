import React from "react";
import AnnotationLabelAnnotationGroup from "./AnnotationLabelAnnotationGroup";
import AnnotationLabelBoolean from "./AnnotationLabelBoolean";
import AnnotationLabelMultipleSelection from "./AnnotationLabelMultipleSelection";
import AnnotationLabelSingleSelection from "./AnnotationLabelSingleSelection";
import AnnotationLabelTextInput from "./AnnotationLabelTextInput";
import AnnotationLabelVideoTimestamp from "./AnnotationLabelVideoTimestamp";

const AnnotationLabelList = props => {
  const {
    labels,
    values,
    annotationId,
    editable,
    imageUri,
    imageFilters,
    options,
    boundaries,
    onChange,
    focus
  } = props;
  const handleChange = (label, value) => {
    if (!editable || values[label.name] === value) {
      return;
    }
    const newValues = { ...values, [label.name]: value };
    onChange(annotationId, newValues);
  };
  const registerHKHandler = (name, handler) => {
    props[name] && props[name](evt => handler(evt));
  };

  /**
   * @param {Nota.Label} label
   * @return {JSX.Element}
   */
  const renderLabel = (label, forceFocus) => {
    switch (label.type) {
      case "ANNOTATION_GROUP":
        return (
          <AnnotationLabelAnnotationGroup
            key={label.name + annotationId}
            label={label}
            value={values}
            annotationId={annotationId}
            imageUri={imageUri}
            imageFilters={imageFilters}
            options={options}
            boundaries={boundaries}
            editable={editable}
            onChange={handleChange}
            focus={forceFocus}
          />
        );
      case "SINGLE_SELECTION":
        if (label.options.items && label.options.items.length) {
          label.options.items.forEach(item => {
            if (item.hotkey !== undefined && item.hotkey.length) {
              registerHKHandler(`hk_${label.name}_${item.value}`, () => {
                handleChange(label, item.value);
                return false;
              });
            }
          });
        }
        return (
          <AnnotationLabelSingleSelection
            key={label.name + annotationId}
            label={label}
            value={values[label.name]}
            editable={editable}
            onChange={value => handleChange(label, value)}
          />
        );
      case "MULTIPLE_SELECTION":
        const value = values[label.name] || [];
        const updateValue = function(label, selectedItem) {
          const newValue = [...value];
          const itemIndex = newValue.indexOf(selectedItem);
          if (itemIndex !== -1) {
            newValue.splice(itemIndex, 1);
          } else {
            newValue.push(selectedItem);
          }

          handleChange(label, newValue);
        };

        if (label.options.items && label.options.items.length) {
          label.options.items.forEach(item => {
            if (item.hotkey !== undefined && item.hotkey.length) {
              registerHKHandler(`hk_${label.name}_${item.value}`, () => {
                updateValue(label, item.value);
                return false;
              });
            }
          });
        }
        return (
          <AnnotationLabelMultipleSelection
            key={label.name + annotationId}
            label={label}
            value={value}
            editable={editable}
            onChange={value => updateValue(label, value)}
          />
        );
      case "BOOLEAN":
        if (label.hotkey && label.hotkey.length) {
          registerHKHandler(`hk_${label.name}`, () => {
            handleChange(label, !values[label.name]);
            return false;
          });
        }
        return (
          <AnnotationLabelBoolean
            key={label.name + annotationId}
            label={label}
            value={values[label.name]}
            editable={editable}
            onChange={value => handleChange(label, value)}
          />
        );
      case "TEXT_INPUT":
        return (
          <AnnotationLabelTextInput
            key={label.name + annotationId}
            label={label}
            value={values[label.name]}
            editable={editable}
            onChange={value => handleChange(label, value)}
          />
        );
      case "VIDEO_TIMESTAMP":
        return (
          <AnnotationLabelVideoTimestamp
            key={label.name + annotationId}
            label={label}
            value={values[label.name]}
            editable={editable}
            onChange={value => handleChange(label, value)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="annotation-label-list">
      {annotationId !== null
        ? labels.map((label, index) => renderLabel(label, focus && index === 0))
        : ""}
    </div>
  );
};

export default AnnotationLabelList;
