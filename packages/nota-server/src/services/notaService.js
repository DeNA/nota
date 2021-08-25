const { Queue } = require("bullmq");
const { JobTask } = require("../models");
const redlock = require("../lib/lock");
const logger = require("../lib/logger");
const notaScheduler = require("./notaScheduler");
const { getRedisClient } = require("../lib/redisClient");

const LOCK_TTL = 1000;
const LOCK_RENEW_INTERVAL = 500;
const MAX_JOBS_TO_KEEP = 100;

const notaService = function(name, processor, scheduler) {
  let queue;
  const processorHandler = async function(job) {
    const loggerHandler = function(level, message, meta = {}) {
      logger[level](message, { ...meta, service: name, jobId: job.id });
    };
    let jobTask = null;
    let lock = null;
    let lockInterval = null;

    try {
      logger.info(`STARTED JOB`, { service: name, jobId: job.id });
      jobTask = await JobTask.findByPk(job.data.serviceJobId);

      if (!jobTask) {
        throw new Error(`JobTask ${job.data.serviceJobId} not found`);
      }

      lock = await redlock.lock(
        `locks:${name}:${jobTask.resourceId ?? "common"}`,
        LOCK_TTL
      );
      lockInterval = setInterval(async () => {
        try {
          await lock?.extend(LOCK_TTL);
        } catch (error) {
          // We cannot access running task scope but we should log and stop the
          // interval to prevent infinite retries on error
          logger.error(error);
          logger.info("Error refreshing lock, stopping lock refresh");

          clearInterval(lockInterval);
        }
      }, LOCK_RENEW_INTERVAL);

      jobTask.startedAt = new Date();
      jobTask.status = JobTask.STATUS.ONGOING;
      await jobTask.save();

      const result = await processor(
        jobTask.resourceId,
        jobTask.data,
        loggerHandler
      );

      jobTask.config = { ...jobTask.config, result };
      jobTask.result = { result };
      jobTask.status = JobTask.STATUS.OK;
    } catch (error) {
      logger.error(`FAILED JOB`, {
        service: name,
        serviceJob: jobTask,
        jobData: job.data,
        jobId: job.id,
        error: { message: error.message, stack: error.stack }
      });

      if (jobTask) {
        jobTask.status = JobTask.STATUS.ERROR;
        jobTask.config = { ...jobTask.config, error: error.message };
      }
    } finally {
      logger.info(`FINISHED JOB`, { service: name, jobId: job.id });
      if (jobTask) {
        jobTask.finishedAt = new Date();
        await jobTask.save();
      }

      clearInterval(lockInterval);

      if (lock) {
        await lock.unlock();
      }
    }
  };

  if (scheduler) {
    notaScheduler.addScheduledTask(
      `${name}_scheduler`,
      scheduler.repeat,
      scheduler.processor
    );
  }

  const service = {
    name,
    get _queue() {
      if (!queue) {
        queue = new Queue(name, {
          connection: getRedisClient()
        });
      }

      return queue;
    },
    get _processor() {
      return processorHandler;
    },
    async add(
      task,
      { projectId, resourceId, data, userId, type = JobTask.TYPE.ADHOC }
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

      const job = await this._queue.add(
        name,
        { jobTaskId: jobTask.id },
        { removeOnComplete: MAX_JOBS_TO_KEEP, removeOnFail: MAX_JOBS_TO_KEEP }
      );

      logger.info(`ADD JOB`, {
        service: name,
        serviceJobId: jobTask.id,
        queueJobId: job.id,
        resourceId,
        data
      });
      return job;
    }
  };

  return service;
};

module.exports = notaService;
