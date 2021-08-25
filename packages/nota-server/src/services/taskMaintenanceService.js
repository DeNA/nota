const notaService = require("./notaService");
const { JobTask } = require("../models");
const taskMaintenance = require("./taskMaintenance");

module.exports = notaService(
  JobTask.TASK_NAME.TASK_MAINTENANCE,
  JobTask.TASK.TASK_MAINTENANCE,
  taskMaintenance
);
