const processorFactory = require("../lib/notaJobQueueProcessorFactory");
const { Task, JobTask } = require("../models");

const processor = processorFactory(JobTask.TASK_NAME.TASK_FETCH, async function(
  jobTask,
  done
) {
  const taskId = jobTask.resourceId;
  const data = jobTask.config.data;
  const userId = jobTask.createdBy;

  if (!taskId || !userId) {
    throw new Error("taskId and userId are required");
  }
  const task = await Task.findByPk(taskId);
  const added = await task.initializeTask(data.refresh);

  if (data.refresh) {
    task.updatedBy = userId;
    await task.save();
  }

  done({ added });
});

module.exports = processor;
