const notaService = require("./notaService");
const { JobTask } = require("../models");
const taskInitialize = require("./taskInitialize");

module.exports = notaService(
  JobTask.TASK_NAME.TASK_FETCH,
  JobTask.TASK.TASK_FETCH,
  taskInitialize
);
