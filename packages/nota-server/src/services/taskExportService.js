const notaService = require("./notaService");
const { JobTask } = require("../models");
const taskExport = require("./taskExport");

module.exports = notaService(
  JobTask.TASK_NAME.TASK_EXPORT,
  JobTask.TASK.TASK_EXPORT,
  taskExport
);
