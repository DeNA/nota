import {
  ACTION_CREATE_ANNOTATION,
  IMAGE_STATUS_DONE,
  IMAGE_STATUS_ONGOING,
  OPTION_FOCUS,
  OPTION_POPUP_FOCUS
} from "../constants";
import {
  parseAnnotationFields,
  validateTextInputLabel
} from "../lib/annotationUtils";
import { Annotation } from "../lib/models";

export const folder = function(state, select) {
  const folders = state.folderList;
  const folderId = state.folderId;

  return folders.find(folder => folder.id === folderId) || null;
};

export const folderTemplate = function(state, select) {
  return (
    (state.taskAssignment.data &&
      state.taskAssignment.data.task.taskTemplate.template) ||
    {}
  );
};

export const folderTemplateOptions = function(state, select) {
  const folderTemplate = select("folderTemplate");

  return folderTemplate.options || {};
};

const getMetadataItem = function(metadataField, imageMetadata) {
  let metadataPath = metadataField;
  let metadataLabel = metadataField;

  if (Array.isArray(metadataField)) {
    const [path, label] = metadataField;

    if (!path) {
      return null;
    }

    metadataPath = path;
    metadataLabel = (label ? label : path).toString();
  }

  const pathItems = metadataPath.toString().split(".");
  let value = imageMetadata[pathItems[0]];

  for (let i = 1; i < pathItems.length; i++) {
    if (value === undefined) {
      return [metadataLabel, undefined];
    }
    value = value[pathItems[i]];
  }

  return value !== undefined
    ? [metadataLabel, value.toString()]
    : [metadataLabel, undefined];
};

export const folderTemplateShownMetadataFields = function(state, select, id) {
  const imageId = id || state.selectedImageId;
  const image = select("image", imageId);
  const imageMetadata =
    image && image.externalMetadata ? image.externalMetadata : {};
  const folderTemplateOptions = select("folderTemplateOptions");
  const showMetadataFields = folderTemplateOptions.showMetadataFields || [];
  const shownMetadata = showMetadataFields
    .map(field => getMetadataItem(field, imageMetadata))
    .filter(field => field !== null);

  return shownMetadata;
};

export const folderTemplateAnnotations = function(state, select) {
  const folderTemplate = select("folderTemplate");

  return folderTemplate.annotations || [];
};

export const annotation = function(state, select, id) {
  const annotations = state.annotations;
  const annotationId = id || state.selectedAnnotationId;
  const annotation = annotations[annotationId];

  if (!annotation) {
    return null;
  }

  return {
    ...annotation
  };
};

export const annotationTemplate = function(state, select, id) {
  const annotation = select("annotation", id);
  const folderTemplateAnnotations = select("folderTemplateAnnotations");

  if (!annotation) {
    return {};
  }

  return (
    folderTemplateAnnotations.find(
      annotationTemplate => annotationTemplate.name === annotation.labelsName
    ) || {}
  );
};

export const annotationFields = function(state, select, id) {
  const annotationTemplate = select("annotationTemplate", id);

  return annotationTemplate.labels || [];
};

export const newAnnotationType = function(state, select) {
  const folderTemplateAnnotations = select("folderTemplateAnnotations");
  const addAnnotation = state.addAnnotation;
  const annotationTemplate = folderTemplateAnnotations.find(
    annotationTemplate => annotationTemplate.name === addAnnotation
  );

  return annotationTemplate || null;
};

export const annotationValues = function(state, select, id) {
  const annotation = select("annotation", id) || {};

  return annotation.labels || {};
};

export const annotationBoundaries = function(state, select) {
  const annotation = select("annotation") || {};

  return annotation.boundaries || {};
};

export const annotationDone = function(state, select) {
  const annotation = select("annotation");

  return annotation && annotation.status === Annotation.STATUS.DONE
    ? true
    : false;
};

export const canAnnotationBeSetAsDone = function(state, select) {
  const annotation = select("annotation");

  if (!annotation) {
    return false;
  }

  const labels = annotation.labels;
  const failedValidations = select("annotationFields").filter(field => {
    if (!field.options.required) {
      return false;
    }
    const value = labels[field.name];

    switch (field.type) {
      case "TEXT_INPUT":
        return !validateTextInputLabel(field, value) || value === "";
      case "MULTIPLE_SELECTION":
        return value === undefined || !value.length;
      default:
        return value === undefined;
    }
  });

  return failedValidations.length === 0;
};

export const image = function(state, select, id) {
  const images = state.imageList;
  const imageId = id || state.selectedImageId;

  return images.find(image => image.id === imageId) || null;
};

export const imageUri = function(state, select, id) {
  const image = select("image", id);
  const projectId = state.taskAssignment.data.project.id;
  const taskId = state.taskAssignment.data.task.id;

  return projectId && taskId && image
    ? `/api/projects/${projectId}/tasks/${taskId}/taskItems/${image.id}/binary`
    : null;
};

export const imageDone = function(state, select) {
  const image = select("image");

  return image && image.status === IMAGE_STATUS_DONE ? true : false;
};

export const imageAnnotations = function(state, select, id) {
  const image = select("image", id) || {};
  const ids = (image.annotations || []).map(annotation => annotation.id);
  const imageAnnotations = [];

  ids.forEach(id => {
    const annotation = select("annotation", id);

    if (annotation) {
      const { options = {}, label } = select("annotationTemplate", id);

      imageAnnotations.push({
        ...annotation,
        color: options.color,
        options,
        label
      });
    }
  });

  return imageAnnotations;
};

export const dirtyAnnotations = function(state, select) {
  return state.imageList.reduce((annotations, image) => {
    image.annotations.forEach(({ id }) => {
      const annotation = state.annotations[id];
      if (annotation && (annotation.isNew || annotation.isDirty)) {
        annotations.push(annotation);
      }
    });

    return annotations;
  }, []);
};

export const annotationLabelFocus = function(state, select) {
  const fields = select("annotationFields");

  let focus = false;

  if (!fields.length) {
    focus = false;
  } else if (state.lastAction === ACTION_CREATE_ANNOTATION) {
    focus = [OPTION_FOCUS, OPTION_POPUP_FOCUS].includes(state.options.onCreate);
  }

  return focus;
};

export const annotationLabelPopup = function(state, select) {
  const fields = select("annotationFields");

  let popup = false;

  if (!fields.length) {
    popup = false;
  } else if (state.lastAction === ACTION_CREATE_ANNOTATION) {
    popup = OPTION_POPUP_FOCUS === state.options.onCreate;
  }

  return popup;
};

export const annotationFieldAnnotations = function(state, select, annotations) {
  const imageAnnotations = annotations || select("imageAnnotations");

  return imageAnnotations.reduce((all, annotation) => {
    const fields = select("annotationFields", annotation.id);

    return all.concat(
      parseAnnotationFields(
        fields,
        annotation.id,
        annotation.labels,
        annotation.color
      )
    );
  }, []);
};

export const doneImages = function(state, select, images) {
  images = images || state.imageList;

  return images.filter(image => image.status === IMAGE_STATUS_DONE);
};

export const firstOngoingImageAnnotationId = function(state, select, id) {
  const annotation = select("annotation");
  const imageAnnotations = select("imageAnnotations", id);
  const firstAnnotation = imageAnnotations.find(
    annotation => annotation.status === Annotation.STATUS.NOT_DONE
  );

  return firstAnnotation
    ? firstAnnotation.id
    : annotation &&
      imageAnnotations.find(
        imageAnnotation => imageAnnotation.id === annotation.id
      )
    ? annotation.id
    : imageAnnotations.length
    ? imageAnnotations[0].id
    : null;
};

export const firstImageAnnotationId = function(state, select, id) {
  const imageAnnotations = select("imageAnnotations", id);

  return imageAnnotations.lenght ? imageAnnotations[0].id : null;
};

export const firstOngoingImageId = function(state, select, images) {
  images = images || state.imageList;
  const firstImage = images.find(
    image => image.status === IMAGE_STATUS_ONGOING
  );

  return firstImage ? firstImage.id : images.length ? images[0].id : null;
};
