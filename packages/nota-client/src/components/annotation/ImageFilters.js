import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "./semantic";

const ImageFilters = props => {
  const { t } = useTranslation();
  const { filters, changeFilters } = props;
  const renderInput = () => (
    <input
      type="range"
      min={-5}
      max={5}
      value={filters.brightness}
      onChange={evt => {
        changeFilters({ brightness: evt.target.value });
      }}
    />
  );
  return (
    <div className="image-filters">
      <div className="image-filters-header">
        <Icon name="sun" />
        {t("image-filters-1")}{" "}
        {filters.brightness > 0 ? "+" + filters.brightness : filters.brightness}
      </div>
      <div className="image-filters-input">{renderInput()}</div>
    </div>
  );
};

export default ImageFilters;
