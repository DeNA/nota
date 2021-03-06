import React from "react";
import SVGScaledImage from "./SVGScaledImage";
import { List, Icon } from "./semantic";
import AnnotationLabelReview from "./containers/AnnotationLabelReviewContainer";
import { MEDIA_TYPE } from "../../constants";

const AnnotationListItem = ({
  mediaType,
  color,
  annotationId,
  boundaries,
  imageUri,
  name,
  active,
  complete,
  editable,
  undeletable,
  onSelect,
  onDelete,
  showReview
}) => {
  const completeIcon = complete ? <Icon name="checkmark box" /> : "";

  return (
    <List.Item onClick={() => !active && onSelect()} active={active}>
      <div className={`header ${complete ? "complete" : ""}`}>
        <div className="status">{completeIcon}</div>
        <div className="color" style={{ backgroundColor: color }} />
        <div className="name">{name}</div>
        <div className="delete">
          {editable && active && !undeletable && (
            <Icon
              title="Delete (del)"
              name="trash"
              color="black"
              onClick={() => onDelete()}
            />
          )}
        </div>
        <div className="undeletable">
          {undeletable && (
            <Icon title="Undeletable" name="lock" color="black" />
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
          {showReview && <AnnotationLabelReview annotationId={annotationId} />}
        </div>
      </div>
    </List.Item>
  );
};

export default AnnotationListItem;
