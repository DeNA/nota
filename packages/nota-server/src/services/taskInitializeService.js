const processorFactory = require("../lib/notaJobQueueProcessorFactory");
const { JobTask } = require("../models");
const taskInitialize = require("./taskInitialize");

module.exports = processorFactory(JobTask.TASK_NAME.TASK_FETCH, taskInitialize);
