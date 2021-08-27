const { Task, JobTask, sequelize } = require("../models");

const taskExport = async function(jobTask, logger) {
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

  return written;
};

module.exports = taskExport;
