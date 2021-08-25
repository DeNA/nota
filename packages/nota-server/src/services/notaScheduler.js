const { Queue } = require("bullmq");
const { logger } = require("../lib/logger");
const { getRedisClient } = require("../lib/redisClient");

const MAX_JOBS_TO_KEEP = 100;
const QUEUE_NAME = "nota_scheduler";
let queue;
const schedulers = {};

const notaScheduler = {
  name: QUEUE_NAME,
  get _queue() {
    if (!queue) {
      queue = new Queue(QUEUE_NAME, {
        connection: getRedisClient()
      });
    }

    return queue;
  },
  async _processor(job) {
    const name = `${QUEUE_NAME}/${job.name}`;
    const loggerHandler = (level, message, meta = {}) => {
      logger[level](message, { ...meta, service: name, jobId: job.id });
    };

    try {
      logger.info(`STARTED SCHEDULER JOB`, { service: name, jobId: job.id });
      const scheduler = schedulers[job.name];

      if (!scheduler) {
        throw new Error(`Processor ${name} not found`);
      }

      await scheduler.processor(loggerHandler);
    } catch (error) {
      logger.error(`FAILED SCHEDULER JOB`, {
        service: name,
        jobId: job.id,
        error: { message: error.message, stack: error.stack }
      });
    } finally {
      logger.info(`FINISHED SCHEDULER JOB`, { service: name, jobId: job.id });
    }
  },
  async addScheduledTask(name, repeat, processor) {
    schedulers[name] = { repeat, processor };
  },
  async start() {
    await this.stop();

    for (const [key, scheduler] of Object.entries(schedulers)) {
      await this._queue.add(
        key,
        {},
        {
          repeat: scheduler.repeat,
          removeOnComplete: MAX_JOBS_TO_KEEP,
          removeOnFail: MAX_JOBS_TO_KEEP
        }
      );
      logger.info(`ADDED SCHEDULER`, { service: key });
    }
  },
  async stop() {
    const jobs = await this._queue.getRepeatableJobs();

    for (const job of jobs) {
      await this._queue.removeRepeatableByKey(job.key);
      logger.info(`STOPPED SCHEDULER`, { service: job.name });
    }
  }
};

module.exports = notaScheduler;
