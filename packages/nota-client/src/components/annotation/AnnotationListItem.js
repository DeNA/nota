import React, { useEffect, useRef } from "react";
import SVGScaledImage from "./SVGScaledImage";
import { List, Icon } from "./semantic";
import AnnotationLabelReview from "./containers/AnnotationLabelReviewContainer";
import { MEDIA_TYPE } from "../../constants";
import { useTranslation } from "react-i18next";

const AnnotationListItem = ({
  mediaType,
  color,
  annotationId,
  boundaries,
  imageUri,
  name,
  order,
  active,
  complete,
  editable,
  undeletable,
  onSelect,
  onDelete,
  showReview
}) => {
  const { t } = useTranslation();
  const completeIcon = complete ? <Icon name="checkmark box" /> : "";
  const wrap = useRef();

  useEffect(() => {
    if (active) {
      wrap.current && wrap.current.scrollIntoView();
    }
  }, [active]);

  return (
    <div ref={wrap}>
      <List.Item onClick={() => !active && onSelect()} active={active}>
        <div className={`header ${complete ? t("complete") : ""}`}>
          <div className="order">{order}</div>
          <div className="status">{completeIcon}</div>
          <div className="color" style={{ backgroundColor: color }} />
          <div className="name">{name}</div>
          <div className="delete">
            {editable && active && !undeletable && (
              <Icon
                title={t("delete-item")}
                name="trash"
                color="black"
                onClick={() => onDelete()}
              />
            )}
          </div>
          <div className="undeletable">
            {undeletable && (
              <Icon title={t("undeletable")} name="lock" color="black" />
            )}
          </div>
        </div>
        <div className="contents">
          <div className="image">
            {mediaType === MEDIA_TYPE.IMAGE ? (
              <SVGScaledImage
                imageUri={imageUri}
                boundaries={boundaries}
                height={100}
              />
            ) : (
              mediaType
            )}
          </div>
          <div className="data">
            {showReview && (
              <AnnotationLabelReview annotationId={annotationId} />
            )}
          </div>
        </div>
      </List.Item>
    </div>
  );
};

export default AnnotationListItem;
