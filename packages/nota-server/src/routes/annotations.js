const { Annotation } = require("../models");

const annotationTemplate = function(annotation) {
  return {
    id: annotation.id,
    boundaries: annotation.boundaries,
    labels: annotation.labels,
    labelsName: annotation.labelsName,
    taskItemId: annotation.taskItemId,
    status: annotation.status
  };
};

const createAnnotation = async function(req, res, next) {
  try {
    const { boundaries, labels, labelsName, status } = req.body;
    const annotation = await res.locals.taskItem.createAnnotation({
      boundaries,
      labels,
      labelsName,
      status,
      createdBy: req.user.id
    });
    const response = await Annotation.findByPk(annotation.id);

    res.locals.response = response;
    res.locals.responseTemplate = annotationTemplate;
    next();
  } catch (err) {
    next(err);
  }
};

const updateAnnotation = async function(req, res, next) {
  try {
    const { boundaries, labels, status } = req.body;
    const annotation = res.locals.annotation;
    const updateData = { updatedBy: req.user.id };
    const updateFields = ["updatedBy"];

    if (boundaries !== undefined) {
      updateData.boundaries = boundaries;
      updateFields.push("boundaries");
    }

    if (labels !== undefined) {
      updateData.labels = labels;
      updateFields.push("labels");
    }

    if (status !== undefined) {
      updateData.status = status;
      updateFields.push("status");
    }

    await annotation.update(updateData, {
      fields: updateFields
    });

    // const response = await Annotation.findByPk(annotation.id);
    res.locals.response = annotation;
    res.locals.responseTemplate = annotationTemplate;
    next();
  } catch (err) {
    next(err);
  }
};

const deleteAnnotation = async function(req, res, next) {
  try {
    await res.locals.annotation.destroy();

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createAnnotation,
  updateAnnotation,
  deleteAnnotation,
  annotationTemplate
};
