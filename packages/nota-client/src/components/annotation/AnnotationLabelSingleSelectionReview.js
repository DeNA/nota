import React from "react";
import InputImageReview from "./InputImageReview";

const AnnotationLabelSingleSelectionReview = ({ label, value }) => {
  switch (label.options.display) {
    case "RADIO":
    case "DROPDOWN":
      const item = label.options.items.find(item => item.value === value);
      if (value === undefined || !item) {
        return <div>--</div>;
      } else {
        return <div>{item.label}</div>;
      }
    case "IMAGE":
      return (
        <InputImageReview
          items={label.options.items}
          itemWidth={label.options.itemWidthReview || 30}
          value={value}
        />
      );
    default:
      return <div>--</div>;
  }
};

export default AnnotationLabelSingleSelectionReview;
