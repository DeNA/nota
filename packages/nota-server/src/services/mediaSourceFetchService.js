const processorFactory = require("../lib/notaJobQueueProcessorFactory");
const mediaSourceFetch = require("./mediaSourceFetch");

module.exports = processorFactory(
  JobTask.TASK_NAME.MEDIA_SOURCE_FETCH,
  mediaSourceFetch
);
