import React from "react";
import { Radio } from "./semantic";

/**
 * @param {{items: Nota.OptionItem[], name: string, value: string, editable: boolean, onChange: any}} props
 */
const SingleSelectionRadio = props => {
  const { items, name, value, editable, onChange } = props;

  /**
   * @param {Nota.OptionItem} item
   */
  const renderItem = item => {
    const hotkey = item.hotkey && item.hotkey.length ? ` (${item.hotkey})` : "";
    return (
      <Radio
        className="radio-button"
        toggle
        key={item.value}
        label={item.label + hotkey}
        value={item.value}
        name={name}
        checked={item.value === value}
        onChange={(evt, { value: newValue }) => {
          const input = evt.currentTarget.getElementsByTagName("input")[0];
          input && input.blur();
          onChange(newValue === value ? undefined : newValue);
        }}
      />
    );
  };

  const renderInput = () => <div>{items.map(item => renderItem(item))}</div>;

  const getValue = (items = [], value) => {
    const item = items.find(item => item.value === value);
    return item !== undefined ? item.label : "--";
  };

  const renderValue = () => <span>{getValue(items, value)}</span>;

  return editable ? renderInput() : renderValue();
};

export default SingleSelectionRadio;
