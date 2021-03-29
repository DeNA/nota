import { selector } from "../lib/selector";
import {
  folder,
  folderTemplate,
  folderTemplateOptions,
  folderTemplateShownMetadataFields,
  folderTemplateAnnotations,
  annotation,
  annotationTemplate,
  annotationFields,
  newAnnotationType,
  annotationValues,
  annotationBoundaries,
  annotationDone,
  canAnnotationBeSetAsDone,
  image,
  imageUri,
  imageDone,
  imageAnnotations,
  dirtyAnnotations,
  annotationLabelFocus,
  annotationLabelPopup,
  annotationFieldAnnotations,
  doneImages,
  firstOngoingImageAnnotationId,
  firstImageAnnotationId,
  firstOngoingImageId
} from "./selectors";

const selectors = {
  folder,
  folderTemplate,
  folderTemplateOptions,
  folderTemplateShownMetadataFields,
  folderTemplateAnnotations,
  annotation,
  annotationTemplate,
  annotationFields,
  newAnnotationType,
  annotationValues,
  annotationBoundaries,
  annotationDone,
  canAnnotationBeSetAsDone,
  image,
  imageUri,
  imageDone,
  imageAnnotations,
  dirtyAnnotations,
  annotationLabelFocus,
  annotationLabelPopup,
  annotationFieldAnnotations,
  doneImages,
  firstOngoingImageAnnotationId,
  firstImageAnnotationId,
  firstOngoingImageId
};

export const registerSelectors = function() {
  const db = selector(null);
  const keys = Object.keys(selectors);

  keys.forEach(key => db.setQuery(key, selectors[key]));
};
