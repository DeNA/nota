const Report = require("../models/report");
const { Project, Task, TaskItem, User, sequelize } = require("../models");

const tasksReferenceTemplate = function(tasksReference) {
  return tasksReference
    .filter(taskReference => taskReference["tasks.id"] !== null)
    .map(taskReference => ({
      id: taskReference["tasks.id"],
      name: taskReference["tasks.name"],
      status: taskReference["tasks.status"],
      projectId: taskReference.id,
      projectName: taskReference.name,
      projectStatus: taskReference.status
    }));
};

const getTasksReference = async function(req, res, next) {
  try {
    const tasks = await Project.scope("raw").findAll({
      attributes: ["id", "name", "status"],
      include: [
        {
          attributes: ["id", "name", "status"],
          model: Task.scope("raw")
        }
      ]
    });

    res.locals.response = tasks;
    res.locals.responseTemplate = tasksReferenceTemplate;
    next();
  } catch (error) {
    next(error);
  }
};

const tasksAnnotatorsReferenceTemplate = function(tasksReference) {
  return tasksReference.map(taskReference => ({
    id: taskReference.taskId,
    name: taskReference["task.name"],
    status: taskReference["task.status"],
    projectId: taskReference["task.projectId"],
    projectName: taskReference["task.project.name"],
    projectStatus: taskReference["task.project.status"],
    annotatorId: taskReference.completedBy,
    annotatorUsername: taskReference["completedByUser.username"]
  }));
};
const getTasksAnnotatorsReference = async function(req, res, next) {
  try {
    const tasks = await TaskItem.scope("raw").findAll({
      raw: true,
      attributes: ["taskId", "completedBy"],
      include: [
        {
          attributes: ["username"],
          model: User.scope("raw"),
          as: "completedByUser"
        },
        {
          attributes: ["name", "status", "projectId"],
          model: Task.scope("raw"),
          include: [
            {
              attributes: ["name", "status"],
              model: Project.scope("raw")
            }
          ]
        }
      ],
      where: {
        completedBy: {
          [sequelize.Sequelize.Op.not]: null
        }
      },
      order: [[Task, Project, "id", "ASC"], [Task, "id", "ASC"]],
      group: ["task_id", "completed_by"]
    });

    res.locals.response = tasks;
    res.locals.responseTemplate = tasksAnnotatorsReferenceTemplate;
    next();
  } catch (error) {
    next(error);
  }
};

const annotatorsTasksReferenceTemplate = function(tasksReference) {
  return tasksReference.map(taskReference => ({
    id: taskReference.taskId,
    name: taskReference["task.name"],
    status: taskReference["task.status"],
    projectId: taskReference["task.projectId"],
    projectName: taskReference["task.project.name"],
    projectStatus: taskReference["task.project.status"],
    annotatorId: taskReference.completedBy,
    annotatorUsername: taskReference["completedByUser.username"]
  }));
};
const getAnnotatorsTasksReference = async function(req, res, next) {
  try {
    const tasks = await TaskItem.scope("raw").findAll({
      raw: true,
      attributes: ["taskId", "completedBy"],
      include: [
        {
          attributes: ["username"],
          model: User.scope("raw"),
          as: "completedByUser"
        },
        {
          attributes: ["name", "status", "projectId"],
          model: Task.scope("raw"),
          include: [
            {
              attributes: ["name", "status"],
              model: Project.scope("raw")
            }
          ]
        }
      ],
      where: {
        completedBy: {
          [sequelize.Sequelize.Op.not]: null
        }
      },
      order: [
        [{ model: User, as: "completedByUser" }, "id", "ASC"],
        [Task, Project, "id", "ASC"],
        [Task, "id", "ASC"]
      ],
      group: ["completed_by", "task_id"]
    });

    res.locals.response = tasks;
    res.locals.responseTemplate = annotatorsTasksReferenceTemplate;
    next();
  } catch (error) {
    next(error);
  }
};

const getTasksStatusReport = async function(req, res, next) {
  try {
    const { from, to, tz = "UTC" } = req.query;
    const report = await Report.taskStatusReport({ from, to, tz });

    res.json(report);
  } catch (error) {
    next(error);
  }
};

const getTasksAnnotatorsReport = async function(req, res, next) {
  try {
    const { from, to, tz = "UTC" } = req.query;
    const report = await Report.taskAnnotatorReport({ from, to, tz });

    res.json(report);
  } catch (error) {
    next(error);
  }
};

const getAnnotatorsTasksReport = async function(req, res, next) {
  try {
    const { from, to, tz = "UTC" } = req.query;
    const report = await Report.annotatorTaskReport({ from, to, tz });

    res.json(report);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasksReference,
  getTasksStatusReport,
  getTasksAnnotatorsReference,
  getTasksAnnotatorsReport,
  getAnnotatorsTasksReference,
  getAnnotatorsTasksReport
};
