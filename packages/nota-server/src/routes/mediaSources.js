const { compareIds, compareByKey } = require("../lib/utils");
const datasource = require("../lib/datasource");
const { MediaSource, JobTask } = require("../models");
const notaJobQueue = require("../lib/notaJobQueue");

const mediaSourcesTemplate = function(mediaSources) {
  return mediaSources.sort(compareIds).map(mediaSourceTemplate);
};
const mediaSourceTemplate = function(mediaSource) {
  return {
    id: mediaSource.id,
    name: mediaSource.name,
    description: mediaSource.description,
    datasource: mediaSource.datasource,
    status: mediaSource.status,
    config: {
      bucket: mediaSource.config.bucket,
      extensions: mediaSource.config.extensions,
      path: mediaSource.config.path,
      exportPath: mediaSource.config.exportPath,
      filters: mediaSource.config.filters
    },
    fetchJobs: mediaSource.fetchJobs,
    projectId: mediaSource.projectId,
    createdAt: mediaSource.createdAt,
    createdBy: mediaSource.createdByUser,
    updatedAt: mediaSource.updatedAt,
    updatedBy: mediaSource.updatedByUser
  };
};
const getMediaSources = async function(req, res, next) {
  try {
    const projects = await res.locals.project.getMediaSources();
    res.locals.response = projects;
    res.locals.responseTemplate = mediaSourcesTemplate;
    next();
  } catch (err) {
    next(err);
  }
};

const getMediaSource = async function(req, res, next) {
  try {
    const fetchJobs = await res.locals.mediaSource.getLastFetchJobs();
    res.locals.mediaSource.fetchJobs = fetchJobs;

    res.locals.response = res.locals.mediaSource;
    res.locals.responseTemplate = mediaSourceTemplate;
    next();
  } catch (err) {
    next(err);
  }
};

const updateMediaSource = async function(req, res, next) {
  try {
    const { name, description } = req.body;

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

    await res.locals.mediaSource.update(updateData, {
      fields: updateFields
    });

    const response = await MediaSource.findByPk(res.locals.mediaSource.id);
    res.locals.response = response;
    res.locals.responseTemplate = mediaSourceTemplate;
    next();
  } catch (err) {
    next(err);
  }
};

const getMediaSourceItemsTree = async function(req, res, next) {
  try {
    const itemsTree = await res.locals.mediaSource.getItemsTree();
    res.locals.response = itemsTree.sort(compareByKey("path"));
    next();
  } catch (err) {
    next(err);
  }
};

const scanMediaSourcePath = async function(req, res, next) {
  try {
    const { subdir = "/", mediaExtensions } = req.body;

    const [dirs, files] = await datasource(
      res.locals.mediaSource
    ).listResources(subdir);

    const mediaFiles = files.filter(
      file =>
        !mediaExtensions ||
        mediaExtensions.some(extension => file.file.endsWith(extension))
    );
    res.locals.response = { dirs, files: mediaFiles.length };
    next();
  } catch (err) {
    next(err);
  }
};

const createMediaSource = async function(req, res, next) {
  try {
    const { name, description, type, config } = req.body;

    if (!name || !description || !type || !config) {
      const error = new Error("Invalid");
      error.status = 400;
      next(error);
      return;
    }

    const mediaSource = await res.locals.project.createMediaSource({
      name,
      description,
      datasource: type,
      config,
      createdBy: req.user.id,
      updatedBy: req.user.id
    });

    await notaJobQueue.add(JobTask.TASK_NAME.MEDIA_SOURCE_FETCH, {
      projectId: res.locals.project.id,
      resourceId: mediaSource.id,
      data: { refresh: false },
      userId: req.user.id
    });

    res.locals.response = { id: mediaSource.id };
    next();
  } catch (error) {
    next(error);
  }
};

const refreshMediaItems = async function(req, res, next) {
  try {
    await notaJobQueue.add(JobTask.TASK_NAME.MEDIA_SOURCE_FETCH, {
      projectId: res.locals.project.id,
      resourceId: res.locals.mediaSource.id,
      data: { refresh: true },
      userId: req.user.id
    });

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

const countMediaItems = async function(req, res, next) {
  try {
    const { options, conditions } = req.body;
    const [taskTemplate] = await res.locals.project.getTaskTemplates({
      where: { id: options.taskTemplateId }
    });

    if (!taskTemplate) {
      const error = new Error("Invalid");
      error.status = 400;
      next(error);
      return;
    }
    const limit = options.limit
      ? Number.isInteger(options.limit) && options.limit > 0
        ? options.limit
        : null
      : null;

    const items = await res.locals.mediaSource.searchMediaItemIds(
      {
        path: options.path || "",
        taskTemplateId: taskTemplate.id,
        extensions: taskTemplate.template.mediaExtensions || [],
        limit,
        excludeAlreadyUsed: options.excludeAlreadyUsed || false
      },
      conditions
    );

    res.locals.response = { items: items.length };
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMediaSources,
  getMediaSource,
  getMediaSourceItemsTree,
  scanMediaSourcePath,
  updateMediaSource,
  createMediaSource,
  refreshMediaItems,
  countMediaItems
};
