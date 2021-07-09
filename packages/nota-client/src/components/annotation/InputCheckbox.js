import React from "react";
import { useTranslation } from "react-i18next";
import { Checkbox } from "./semantic";

/**
 * @param {{item: Nota.OptionItem, name?: string, checked: boolean, editable: boolean, onChange: any}} props
 */
const SingleSelectionRadio = props => {
  const { t } = useTranslation();
  const { item, checked, editable, onChange } = props;
  const renderInput = () => (
    <Checkbox
      toggle
      key={item.value}
      label={item.label}
      value={item.value}
      checked={checked}
      onChange={(evt, { checked }) => {
        const input = evt.currentTarget.getElementsByTagName("input")[0];
        input && input.blur();
        onChange(checked);
      }}
    />
  );

  const renderValue = () => <span>{checked ? t("yes") : t("no")}</span>;

  return editable ? renderInput() : renderValue();
};

export default SingleSelectionRadio;
