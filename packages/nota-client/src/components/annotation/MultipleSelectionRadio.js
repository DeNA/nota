import React from "react";
import { Checkbox } from "./semantic";

/**
 * @param {{items: Nota.OptionItem[], name: string, value: string, editable: boolean, onChange: any}} props
 */
const MultipleSelectionRadio = props => {
  const { items, name, value, editable, onChange } = props;

  /**
   * @param {Nota.OptionItem} item
   */
  const renderItem = item => {
    const hotkey = item.hotkey && item.hotkey.length ? ` (${item.hotkey})` : "";
    return (
      <Checkbox
        className="radio-button"
        key={item.value}
        label={item.label + hotkey}
        value={item.value}
        name={name + item.value}
        checked={value.includes(item.value)}
        onChange={(evt, { value: newValue }) => {
          const input = evt.currentTarget.getElementsByTagName("input")[0];
          input && input.blur();

          onChange(newValue);
        }}
      />
    );
  };

  const renderInput = () => <div>{items.map(item => renderItem(item))}</div>;

  const getValue = (items = [], value) => {
    const textValues = (value || [])
      .map(value => {
        const item = items.find(item => item.value === value);
        return item !== undefined ? item.label : null;
      })
      .filter(value => value !== null);

    return textValues.length ? textValues.join(",") : "--";
  };

  const renderValue = () => <span>{getValue(items, value)}</span>;

  return editable ? renderInput() : renderValue();
};

export default MultipleSelectionRadio;
