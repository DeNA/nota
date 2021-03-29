const { logger } = require("./logger");
const { JobTask } = require("../models");

module.exports = function(task, processor) {
  return async function({ id, data }, done) {
    logger.info({
      logType: "service",
      message: "Job started",
      job: { task, jobTask: data.jobTaskId, jobId: id }
    });
    const jobTask = await JobTask.findByPk(data.jobTaskId);

    try {
      jobTask.status = JobTask.STATUS.ONGOING;
      jobTask.startedAt = new Date();
      await jobTask.save();

      await processor(jobTask, async result => {
        jobTask.status = JobTask.STATUS.OK;
        jobTask.finishedAt = new Date();
        jobTask.config = { ...jobTask.config, result };
        await jobTask.save();
      });
      done();
    } catch (error) {
      jobTask.status = JobTask.STATUS.ERROR;
      jobTask.finishedAt = new Date();
      jobTask.config = { ...jobTask.config, error: error.message };
      await jobTask.save();
      done(error);
    } finally {
      logger.info({
        logType: "service",
        message: "Job finished",
        job: { task, jobTask: data.jobTaskId, jobId: id }
      });
    }
  };
};
