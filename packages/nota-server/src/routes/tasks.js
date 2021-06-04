const { compareIds } = require("../lib/utils");
const { MediaSource, Task, TaskAssignment, JobTask } = require("../models");
const notaJobQueue = require("../lib/notaJobQueue");
const { absolutePath } = require("../lib/datasource/utils");
const datasource = require("../lib/datasource");

const taskResponseTemplate = function(task) {
  return {
    id: task.id,
    projectId: task.projectId,
    name: task.name,
    description: task.description,
    status: task.status,
    template: task.taskTemplate,
    mediaSource: { id: task.mediaSource.id, name: task.mediaSource.name },
    mediaSourceOptions: {
      path: task.mediaSourceConfig.options.path,
      excludeAlreadyUsed:
        task.mediaSourceConfig.options.excludeAlreadyUsed || false,
      limit: task.mediaSourceConfig.options.limit || null
    },
    mediaSourceConditions: (task.mediaSource.config.filters || []).map(
      filter => ({
        label: filter.label,
        value: (task.mediaSourceConfig.conditions || {})[filter.name] || null
      })
    ),
    assignments: task.taskAssignments
      ? task.taskAssignments.sort(compareIds).map(ta => {
          return {
            id: ta.id,
            annotator: ta.annotatorUser,
            status: ta.status,
            done: parseInt(ta.get("done")),
            total: parseInt(ta.get("total")),
            createdAt: ta.createdAt,
            updatedAt: ta.updatedAt
          };
        })
      : undefined,
    exportJobs: task.exportJobs,
    fetchJobs: task.fetchJobs,
    maintenanceJobs: task.maintenanceJobs,
    done: parseInt(task.get("done")),
    total: parseInt(task.get("total")),
    assignable:
      parseInt(task.get("total")) > 0 ? parseInt(task.get("assignable")) : 0,
    createdAt: task.createdAt,
    createdBy: task.createdByUser,
    updatedAt: task.updatedAt,
    updatedBy: task.updatedByUser
  };
};
const tasksTemplate = function(tasks) {
  return tasks.sort(compareIds).map(taskResponseTemplate);
};
const getTasks = async function(req, res, next) {
  try {
    res.locals.response = await Task.scope([
      "defaultScope",
      "withTaskItemsCount"
    ]).findAll({ where: { projectId: res.locals.project.id } });
    res.locals.responseTemplate = tasksTemplate;
    next();
  } catch (err) {
    next(err);
  }
};

const getTask = async function(req, res, next) {
  try {
    const task = await Task.scope([
      "defaultScope",
      "withTaskItemsCount"
    ]).findByPk(res.locals.task.id);

    const assignments = await TaskAssignment.scope([
      "defaultScope",
      "withTaskItemsCount"
    ]).findAll({
      where: {
        taskId: res.locals.task.id
      }
    });
    task.taskAssignments = assignments;

    const exportJobs = await task.getLastExportJobs();
    task.exportJobs = exportJobs;
    const fetchJobs = await task.getLastFetchJobs();
    task.fetchJobs = fetchJobs;
    const maintenanceJobs = await task.getLastMaintenanceJobs();
    task.maintenanceJobs = maintenanceJobs;

    res.locals.response = task;
    res.locals.responseTemplate = taskResponseTemplate;
    next();
  } catch (err) {
    next(err);
  }
};

const createTask = async function(req, res, next) {
  const { name, description, mediaSourceId, options, conditions } = req.body;
  let task;

  try {
    const [taskTemplate] = await res.locals.project.getTaskTemplates({
      where: { id: options.taskTemplateId }
    });
    const mediaSource = await MediaSource.findByPk(mediaSourceId, {
      attributes: ["id"],
      where: {
        projectId: res.locals.project.id
      }
    });

    if (!taskTemplate || !mediaSource) {
      const error = new Error("Invalid");
      error.status = 400;
      next(error);
      return;
    }

    task = await res.locals.project.createTask({
      name,
      description,
      taskTemplateId: taskTemplate.id,
      mediaSourceId: mediaSource.id,
      mediaSourceConfig: {
        options: {
          path: absolutePath("", [options.path], false, false),
          excludeAlreadyUsed: options.excludeAlreadyUsed,
          limit: options.limit
        },
        conditions
      },
      status: Task.STATUS.CREATING,
      createdBy: req.user.id,
      updatedBy: req.user.id
    });

    await notaJobQueue.add(JobTask.TASK_NAME.TASK_FETCH, {
      projectId: res.locals.project.id,
      resourceId: task.id,
      data: { refresh: false },
      userId: req.user.id
    });

    res.locals.response = { id: task.id };
    next();
  } catch (error) {
    next(error);
  }
};

const updateTask = async function(req, res, next) {
  try {
    const { name, description, status } = req.body;

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

    if (
      status !== undefined &&
      [Task.STATUS.READY, Task.STATUS.HIDDEN, Task.STATUS.DONE].includes(
        res.locals.task.status
      ) &&
      [Task.STATUS.READY, Task.STATUS.HIDDEN, Task.STATUS.DONE].includes(
        parseInt(status)
      )
    ) {
      updateData.status = status;
      updateFields.push("status");
    }

    await res.locals.task.update(updateData, {
      fields: updateFields
    });

    const response = await Task.findByPk(res.locals.task.id);
    res.locals.response = response;
    res.locals.responseTemplate = taskResponseTemplate;
    next();
  } catch (err) {
    next(err);
  }
};

const deleteTask = async function(req, res, next) {
  try {
    if (
      [Task.STATUS.CREATING, Task.STATUS.DELETED].includes(
        res.locals.task.status
      )
    ) {
      const error = new Error("Invalid");
      error.status = 400;
      next(error);
      return;
    }

    await res.locals.task.softDelete(req.user);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

const refreshTaskItems = async function(req, res, next) {
  try {
    await notaJobQueue.add(JobTask.TASK_NAME.TASK_FETCH, {
      projectId: res.locals.project.id,
      resourceId: res.locals.task.id,
      data: { refresh: true },
      userId: req.user.id
    });

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

/**
 * req.body
 *  // taskItems/annotations status reset
 * {
 *   type: "STATUS_RESET",
 *   options: {
 *     annotations?: boolean,
 *     taskItems?: boolean,
 *     taskAssignments?: boolean,
 *     annotationConditions?: {
 *       name?: string[]
 *     },
 *     taskItemConditions?: {
 *       onlyWithOngoing?: boolean
 *     },
 *     taskAssignmentConditions?: {
 *       onlyWithOngoing?: boolean
 *     }
 *   }
 * }
 */
const taskMaintenance = async function(req, res, next) {
  const { type, options } = req.body;

  if (!type || !options) {
    const error = new Error("Invalid");
    error.status = 400;
    next(error);
    return;
  }

  try {
    await notaJobQueue.add(JobTask.TASK_NAME.TASK_MAINTENANCE, {
      projectId: res.locals.project.id,
      resourceId: res.locals.task.id,
      data: { type, options },
      userId: req.user.id
    });

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

const exportTask = async function(req, res, next) {
  try {
    const {
      target = Task.EXPORT_TARGET.ALL,
      includeOngoing = true,
      name
    } = req.body;
    await notaJobQueue.add(JobTask.TASK_NAME.TASK_EXPORT, {
      projectId: res.locals.project.id,
      resourceId: res.locals.task.id,
      data: { target, includeOngoing, name },
      userId: req.user.id
    });

    res.json({ message: "Enqueued" });
  } catch (err) {
    next(err);
  }
};

const downloadTask = async function(req, res, next) {
  try {
    const mediaSource = await res.locals.task.getMediaSource();
    const ds = datasource(mediaSource);
    const exportTask = await JobTask.findOne({
      where: {
        id: req.params.exportTaskId,
        task: JobTask.TASK.TASK_EXPORT,
        status: JobTask.STATUS.OK,
        resourceId: res.locals.task.id
      }
    });

    if (!exportTask) {
      const err = new Error("Not Found");
      err.status = 404;
      next(err);
      return;
    }

    const url = await ds.getDownloadUrl({
      fileName: exportTask.config.result.file
    });

    res.redirect(url);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  exportTask,
  downloadTask,
  refreshTaskItems,
  taskMaintenance
};
