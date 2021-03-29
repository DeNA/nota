const processorFactory = require("../lib/notaJobQueueProcessorFactory");
const { Task, JobTask, sequelize } = require("../models");

const processor = processorFactory(
  JobTask.TASK_NAME.TASK_EXPORT,
  async function(jobTask, done) {
    const taskId = jobTask.resourceId;
    const data = jobTask.config.data;
    const userId = jobTask.createdBy;

    if (!taskId || !userId) {
      throw new Error("taskId and userId are required");
    }
    const task = await Task.findByPk(taskId);
    const options = {
      includeOngoing: data.includeOngoing,
      name: data.name
    };

    if (data.target === Task.EXPORT_TARGET.NEW_AND_UPDATED) {
      options.to = jobTask.createdAt;
      const [previousJob] = await JobTask.findAll({
        where: {
          projectId: jobTask.projectId,
          resourceId: taskId,
          task: JobTask.TASK.TASK_EXPORT,
          id: {
            [sequelize.Sequelize.Op.lt]: jobTask.id
          },
          status: JobTask.STATUS.OK
        },
        order: [["id", "DESC"]],
        limit: 1
      });

      if (previousJob) {
        options.from = previousJob.createdAt;
      }
    }

    const written = await task.exportTask(options);

    done(written);
  }
);

module.exports = processor;
