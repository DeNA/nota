const { Task } = require("../models");

const taskInitialize = async function(jobTask, logger) {
  const taskId = jobTask.resourceId;
  const data = jobTask.config.data;
  const userId = jobTask.createdBy;

  if (!taskId || !userId) {
    throw new Error("taskId and userId are required");
  }
  const task = await Task.findByPk(taskId);
  const added = await task.initializeTask(data.refresh);

  if (data.refresh) {
    task.updatedBy = userId;
    await task.save();
  }

  return { added };
};

module.exports = taskInitialize;
