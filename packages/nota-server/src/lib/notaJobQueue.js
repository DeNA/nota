const Bull = require("bull");
const { logger } = require("./logger");
const { redis } = require("../config");
const { JobTask } = require("../models");

const queueOptions = {
  redis: {
    host: redis.host
  },
  prefix: "nota",
  settings: {
    maxStalledCount: 1
  }
};

const queues = {
  [JobTask.TASK_NAME.MEDIA_SOURCE_FETCH]: new Bull(
    "job-queue-media-source-fetch",
    queueOptions
  ),
  [JobTask.TASK_NAME.TASK_FETCH]: new Bull(
    "job-queue-task-fetch",
    queueOptions
  ),
  [JobTask.TASK_NAME.TASK_EXPORT]: new Bull(
    "job-queue-task-export",
    queueOptions
  )
};
logger.info({ logType: "service", message: "nota-job-service initialized" });

module.exports = {
  add: async function(
    task,
    { projectId, resourceId, type = JobTask.TYPE.ADHOC, userId, data }
  ) {
    const jobTask = await JobTask.create({
      projectId,
      resourceId,
      task: JobTask.TASK[task],
      type,
      status: JobTask.STATUS.NOT_STARTED,
      config: { data },
      createdBy: userId
    });
    const job = await queues[task].add({ jobTaskId: jobTask.id });
    logger.info({
      logType: "service",
      message: "Job registered",
      job: { task, jobTask: jobTask.id, jobId: job.id }
    });
    return job;
  },
  notaJobQueues: queues
};
