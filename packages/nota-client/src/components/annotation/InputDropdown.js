import React from "react";
import { Dropdown } from "./semantic";

/**
 * @param {{items: Nota.OptionItem[], name?: string, value: string, editable: boolean, onChange: any, ignoreFocus: boolean}} props
 */
const SingleSelectionDropdown = props => {
  const { items, value, editable, onChange, ignoreFocus } = props;

  /**
   * @param {Nota.OptionItem[]} items
   */
  const convertOptions = items => {
    return items.map(item => {
      const hotkey =
        item.hotkey && item.hotkey.length ? ` (${item.hotkey})` : "";
      return { text: item.label + hotkey, value: item.value };
    });
  };

  const renderInput = () => (
    <Dropdown
      selection
      fluid
      options={convertOptions(items)}
      value={value}
      onChange={(evt, { value }) => onChange(value)}
      onMouseDown={evt => ignoreFocus && evt.preventDefault()}
    />
  );

  const getValue = (items = [], value) => {
    const item = items.find(item => item.value === value);
    return item !== undefined ? item.label : "--";
  };

  const renderValue = () => <span>{getValue(items, value)}</span>;

  return editable ? renderInput() : renderValue();
};

export default SingleSelectionDropdown;
