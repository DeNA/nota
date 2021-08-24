import React from "react";
import { useTranslation } from "react-i18next";
import AnnotationLabelSingleSelectionReview from "./AnnotationLabelSingleSelectionReview";
import AnnotationLabelVideoTimestampReview from "./AnnotationLabelVideoTimestampReview";

const AnnotationLabelReview = props => {
  const { t } = useTranslation();
  const { labels, values, annotationId } = props;

  /**
   * @param {Nota.Label} label
   * @return {JSX.Element}
   */
  const renderLabel = label => {
    switch (label.type) {
      case "ANNOTATION_GROUP":
        return null;
      case "SINGLE_SELECTION":
        return (
          <AnnotationLabelSingleSelectionReview
            key={label.name}
            label={label}
            value={values[label.name]}
          />
        );
      case "BOOLEAN":
        const value = values[label.name];
        return (
          <div key={label.name}>
            <span>
              {value !== undefined ? (value ? t("yes") : t("no")) : "--"}
            </span>
          </div>
        );
      case "TEXT_INPUT":
        return <div key={label.name}>{values[label.name]}</div>;
      case "VIDEO_TIMESTAMP":
        return (
          <AnnotationLabelVideoTimestampReview
            key={label.name}
            label={label}
            value={values[label.name]}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="annotation-label-review">
      {annotationId !== null ? labels.map(label => renderLabel(label)) : ""}
    </div>
  );
};

export default AnnotationLabelReview;
