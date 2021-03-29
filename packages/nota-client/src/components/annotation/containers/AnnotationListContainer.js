import { connect } from "react-redux";
import AnnotationList from "../AnnotationList";
import {
  deleteAnnotation,
  selectImageAnnotationByUser
} from "../../../actions";
import hotkeys from "../../../lib/Hotkeys";
import { MEDIA_TYPE } from "../../../constants";
import { selector } from "../../../lib/selector";
import { Annotation } from "../../../lib/models";

const getAnnotationTemplate = (template, labelsName) => {
  if (!template || !template.annotations) {
    return {};
  }

  const annotationTemplate = template.annotations.find(
    annotation => annotation.name === labelsName
  );

  return annotationTemplate ? annotationTemplate : {};
};

/**
 * @param {Nota.Annotation[]} annotations
 * @param {any} templates
 */
const setAnnotationCompletionStatus = (annotations, templates) => {
  return annotations
    .map(annotation => {
      const template = getAnnotationTemplate(templates, annotation.labelsName);
      const name = template.label || "";
      const complete = annotation.status === Annotation.STATUS.DONE;
      const undeletable = template.options && template.options.undeletable;
      return { ...annotation, complete, name, undeletable };
    })
    .sort((a, b) => {
      if (a.undeletable) {
        return -1;
      }
      if (b.undeletable) {
        return 1;
      }

      return 0;
    });
};

const mapStateToProps = state => {
  const db = selector(state);
  const template = db.select("folderTemplate");
  const mediaType = template.mediaType || MEDIA_TYPE.IMAGE;
  const templateOptions = db.select("folderTemplateOptions");
  const annotations = db.select("imageAnnotations");

  return {
    annotations: setAnnotationCompletionStatus(annotations, template),
    imageUri: db.select("imageUri"),
    selectedAnnotationId: state.selectedAnnotationId,
    editable: state.editable && !db.select("imageDone"),
    showReview: templateOptions.showReview,
    mediaType
  };
};

const mapDispatchToProps = dispatch => {
  return {
    selectAnnotation: annotationId => {
      dispatch(selectImageAnnotationByUser(annotationId));
    },
    deleteAnnotation: annotation => {
      dispatch(deleteAnnotation(annotation));
    }
  };
};

const bindings = {
  onSelectNext: "right",
  onSelectPrevious: "left",
  onDelete: "del"
};
const AnnotationListContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(hotkeys(bindings)(AnnotationList));
export default AnnotationListContainer;
