import React from "react";
import AnnotationListItem from "./AnnotationListItem";
import { List } from "./semantic";
import { DEFAULT_ANNOTATION_COLOR } from "../../constants";

const AnnotationList = ({
  showReview,
  annotations,
  imageUri,
  selectedAnnotationId,
  selectAnnotation,
  deleteAnnotation,
  editable,
  mediaType,
  onSelectNext,
  onSelectPrevious,
  onDelete
}) => {
  onSelectNext(evt => {
    const nextIndex =
      annotations.findIndex(
        annotation => selectedAnnotationId === annotation.id
      ) + 1;
    if (nextIndex < annotations.length) {
      selectAnnotation(annotations[nextIndex].id);
    }
    return false;
  });
  onSelectPrevious(evt => {
    const previousIndex =
      annotations.findIndex(
        annotation => selectedAnnotationId === annotation.id
      ) - 1;
    if (previousIndex >= 0) {
      selectAnnotation(annotations[previousIndex].id);
    }
    return false;
  });
  onDelete(evt => {
    if (!editable) {
      return;
    }
    const annotation = annotations.find(
      annotation => selectedAnnotationId === annotation.id
    );

    if (annotation.undeletable) {
      return;
    }
    deleteAnnotation(annotation);
    return false;
  });

  const renderAnnotation = annotation => {
    return (
      <AnnotationListItem
        key={annotation.id}
        mediaType={mediaType}
        color={annotation.color || DEFAULT_ANNOTATION_COLOR}
        showReview={showReview && annotation.complete}
        annotationId={annotation.id}
        imageUri={imageUri}
        boundaries={annotation.boundaries}
        name={annotation.name}
        active={selectedAnnotationId === annotation.id}
        complete={annotation.complete}
        editable={editable}
        undeletable={annotation.undeletable}
        onSelect={() => selectAnnotation(annotation.id)}
        onDelete={() => deleteAnnotation(annotation)}
      />
    );
  };
  return (
    <List className="annotation-list">
      {annotations.map((annotation, index) => renderAnnotation(annotation))}
    </List>
  );
};

export default AnnotationList;
