const { Queue, Job } = require("bullmq");
const { JobTask } = require("../models");
const { logger } = require("../lib/logger");
const notaScheduler = require("./notaScheduler");
const { getRedisClient } = require("../lib/redisClient");

const notaService = function(name, task, processor, scheduler) {
  let queue;
  const processorHandler = async function(job) {
    const loggerHandler = function(level, message, meta = {}) {
      logger[level](message, { ...meta, service: name, jobId: job.id });
    };
    let jobTask = null;

    try {
      logger.info(`STARTED JOB`, { service: name, jobId: job.id });
      jobTask = await JobTask.findByPk(job.data.jobTaskId);

      if (!jobTask) {
        throw new Error(`JobTask ${job.data.jobTaskId} not found`);
      }

      await jobTask.update({
        startedAt: new Date(),
        status: JobTask.STATUS.ONGOING
      });

      const result = await processor(jobTask, loggerHandler);

      await jobTask.update({
        config: { ...jobTask.config, result },
        result: { result },
        finishedAt: new Date(),
        status: JobTask.STATUS.OK
      });
    } catch (error) {
      logger.error(`FAILED JOB`, {
        service: name,
        serviceJob: jobTask,
        jobData: job.data,
        jobId: job.id,
        error: { message: error.message, stack: error.stack }
      });

      if (jobTask) {
        await jobTask.update({
          config: { ...jobTask.config, error: error.message },
          finishedAt: new Date(),
          status: JobTask.STATUS.ERROR
        });
      }
    } finally {
      logger.info(`FINISHED JOB`, { service: name, jobId: job.id });
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
    async add({
      projectId,
      resourceId,
      data,
      userId,
      type = JobTask.TYPE.ADHOC
    }) {
      const jobId = `t_${task}::p_${projectId}::r_${resourceId}`;
      const existingJob = await Job.fromId(this._queue, jobId);

      if (existingJob) {
        return null;
      }

      const jobTask = await JobTask.create({
        projectId,
        resourceId,
        task,
        type,
        status: JobTask.STATUS.NOT_STARTED,
        config: { data },
        createdBy: userId
      });

      const job = await this._queue.add(
        name,
        { jobTaskId: jobTask.id },
        { removeOnComplete: true, removeOnFail: true, jobId }
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
