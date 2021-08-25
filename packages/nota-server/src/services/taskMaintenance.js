const { Task } = require("../models");

const taskMaintenance = async function(jobTask, logger) {
  const taskId = jobTask.resourceId;
  const data = jobTask.config.data;
  const userId = jobTask.createdBy;

  if (!taskId || !userId || !data) {
    throw new Error("taskId and userId are required");
  }
  const task = await Task.findByPk(taskId);
  let result;

  if (data.type === "STATUS_RESET") {
    result = await task.statusReset(data.options);
  } else {
    throw new Error(`unsuported maintenance type: ${data.type}`);
  }

  return result;
};

module.exports = taskMaintenance;
