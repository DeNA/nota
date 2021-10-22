const {
  Task,
  TaskAssignment,
  TaskItem,
  User,
  sequelize
} = require("../models");
const { taskItemTemplate } = require("./taskItems");

const taskAssignmentTemplate = function(taskAssignment) {
  return {
    id: taskAssignment.id,
    status: taskAssignment.status,
    annotator: taskAssignment.annotatorUser,
    project: taskAssignment.task.project,
    task: taskAssignment.task,
    taskItems: taskAssignment.taskItems.map(taskItemTemplate),
    editable: taskAssignment.editable
  };
};
const getTaskAssignment = async function(req, res, next) {
  try {
    const taskAssignment = await TaskAssignment.scope("forAnnotation").findByPk(
      res.locals.taskAssignment.id
    );
    taskAssignment.taskItems = await TaskItem.scope("forAnnotation").findAll({
      where: {
        taskAssignmentId: taskAssignment.id
      }
    });

    taskAssignment.editable =
      taskAssignment.status === TaskAssignment.STATUS.ANNOTATION_READY &&
      taskAssignment.task.canBeAnnotated() &&
      (taskAssignment.task.status === Task.STATUS.HIDDEN
        ? res.locals.project.policy(req.user).canAdmin
        : true) &&
      (taskAssignment.annotator === req.user.id ||
        res.locals.project.policy(req.user).canAdmin);

    res.locals.response = taskAssignment;
    res.locals.responseTemplate = taskAssignmentTemplate;
    next();
  } catch (error) {
    next(error);
  }
};

const createTaskAssignment = async function(req, res, next) {
  try {
    const size = parseInt(req.body.size);
    const random = req.body.random || false;

    const transaction = await sequelize.transaction();

    const taskAssignment = await res.locals.task.createTaskAssignment(
      {
        status: TaskAssignment.STATUS.CREATING,
        annotator: req.user.id,
        createdBy: req.user.id
      },
      { transaction }
    );

    const done = await taskAssignment.assignTaskItems(
      size,
      random,
      req.user,
      transaction
    );

    if (!done) {
      await transaction.rollback();
    } else {
      await transaction.commit();
    }

    res.locals.response = {
      id: done ? taskAssignment.id : null
    };
    next();
  } catch (error) {
    next(error);
  }
};

const updateTaskAssignment = async function(req, res, next) {
  try {
    const { status, annotatorId } = req.body;

    // Admin or annotator fields : status
    if (
      !res.locals.project.policy(req.user).canAdmin &&
      res.locals.taskAssignment.annotator !== req.user.id
    ) {
      const error = new Error("Bad request");
      error.status = 400;
      next(error);
      return;
    }

    const updateData = {
      updatedBy: req.user.id
    };
    const updateFields = ["updatedBy"];

    if (status !== undefined) {
      updateData.status = status;
      updateFields.push("status");
    }

    // Admin fields
    if (annotatorId !== undefined) {
      const newAnnotator = await User.findByPk(annotatorId);

      if (
        !newAnnotator ||
        !res.locals.project.policy(newAnnotator).canRead ||
        !res.locals.project.policy(req.user).canAdmin
      ) {
        const error = new Error("Bad request");
        error.status = 400;
        next(error);
        return;
      }

      updateData.annotator = annotatorId;
      updateFields.push("annotator");
    }

    await res.locals.taskAssignment.update(updateData, {
      fields: updateFields
    });

    const response = await TaskAssignment.findByPk(
      res.locals.taskAssignment.id
    );
    res.locals.response = response;
    next();
  } catch (error) {
    next(error);
  }
};

const returnUnfinishedTaskItems = async function(req, res, next) {
  try {
    if (
      !res.locals.project.policy(req.user).canAdmin &&
      res.locals.taskAssignment.annotator !== req.user.id
    ) {
      const error = new Error("Bad request");
      error.status = 400;
      next(error);
      return;
    }

    await sequelize.transaction(async transaction => {
      await res.locals.taskAssignment.returnUnfinishedTaskItems(
        req.user,
        transaction
      );
    });

    res.sendStatus(201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTaskAssignment,
  createTaskAssignment,
  updateTaskAssignment,
  returnUnfinishedTaskItems
};
