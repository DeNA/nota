const { TaskTemplate } = require("../models");
const { compareIds } = require("../lib/utils");

const taskTemplatesTemplate = function(templates) {
  return templates.sort(compareIds).map(template => ({
    id: template.id,
    name: template.name,
    description: template.description,
    projectId: template.projectId,
    mediaExtensions: template.template.mediaExtensions || null
  }));
};
const getTemplates = async function(req, res, next) {
  try {
    res.locals.response = await res.locals.project.getTaskTemplates();
    res.locals.responseTemplate = taskTemplatesTemplate;
    next();
  } catch (err) {
    next(err);
  }
};

const taskTemplateTemplate = function(template) {
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    template: template.template,
    projectId: template.projectId,
    createdAt: template.createdAt,
    createdBy: template.createdByUser,
    updatedAt: template.updatedAt,
    updatedBy: template.updatedByUser
  };
};
const getTemplate = async function(req, res, next) {
  res.locals.response = res.locals.taskTemplate;
  res.locals.responseTemplate = taskTemplateTemplate;
  next();
};

const createTemplate = async function(req, res, next) {
  try {
    const { name, description, template } = req.body;
    const taskTemplate = await res.locals.project.createTaskTemplate({
      name,
      description,
      template,
      createdBy: req.user.id
    });

    const response = TaskTemplate.findByPk(taskTemplate.id);
    res.locals.response = response;
    res.locals.responseTemplate = taskTemplateTemplate;
    next();
  } catch (err) {
    next(err);
  }
};

const updateTemplate = async function(req, res, next) {
  try {
    const { name, description, template } = req.body;

    const updateData = {
      updatedBy: req.user.id
    };
    const updateFields = ["updatedBy"];

    if (name !== undefined) {
      updateData.name = name;
      updateFields.push("name");
    }

    if (description !== undefined) {
      updateData.description = description;
      updateFields.push("description");
    }

    if (template !== undefined) {
      updateData.template = template;
      updateFields.push("template");
    }

    await res.locals.taskTemplate.update(updateData, {
      fields: updateFields
    });

    const response = TaskTemplate.findByPk(res.locals.taskTemplate.id);
    res.locals.response = response;
    res.locals.responseTemplate = taskTemplateTemplate;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate
};
