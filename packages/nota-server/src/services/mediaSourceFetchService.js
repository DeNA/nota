const mediaSourceFetch = require("./mediaSourceFetch");
const notaService = require("./notaService");
const { JobTask } = require("../models");

module.exports = notaService(
  JobTask.TASK_NAME.MEDIA_SOURCE_FETCH,
  JobTask.TASK.MEDIA_SOURCE_FETCH,
  mediaSourceFetch
);
