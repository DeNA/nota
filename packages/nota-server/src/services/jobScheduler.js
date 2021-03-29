const { logger } = require("../lib/logger");
const { Op } = require("sequelize");
const { Task, MediaSource, JobTask } = require("../models");
const parser = require("cron-parser");
const moment = require("moment");
const notaJobQueue = require("../lib/notaJobQueue");

const shouldJobBeExecuted = function(lastExecutionTimestamp, cron) {
  if (!cron) {
    return [false];
  }

  const lastExecutionDate = lastExecutionTimestamp
    ? moment.unix(lastExecutionTimestamp)
    : null;
  const nowDate = moment();
  const interval = parser.parseExpression(cron);
  const nextExecutionDate = moment(interval.prev().toDate());

  return [
    nowDate.isSameOrAfter(nextExecutionDate) &&
      (!lastExecutionDate || lastExecutionDate.isBefore(nextExecutionDate)),
    nowDate.unix()
  ];
};

// fetchSchedule format
// Fetch every 3 hours example
// cron/userId are required
// {"lastExecution":1565934480,"config":{"cron":"* */3 * * *","userId":1}}
const mediaSourceFetchScheduler = async function() {
  const mediaSources = await MediaSource.findAll({
    attributes: ["id", "projectId", "isFetchScheduled", "fetchSchedule"],
    where: {
      isFetchScheduled: true
    }
  });

  for (let i = 0; i < mediaSources.length; i++) {
    const mediaSource = mediaSources[i];

    if (!mediaSource.fetchSchedule) {
      continue;
    }

    const { lastExecution, config = {} } = mediaSource.fetchSchedule;
    const [execute, now] = shouldJobBeExecuted(lastExecution, config.cron);

    if (!config.userId) {
      continue;
    }

    if (execute) {
      await notaJobQueue.add(JobTask.TASK_NAME.MEDIA_SOURCE_FETCH, {
        projectId: mediaSource.projectId,
        resourceId: mediaSource.id,
        type: JobTask.TYPE.SCHEDULED,
        data: { refresh: true },
        userId: config.userId
      });

      mediaSource.fetchSchedule = {
        ...mediaSource.fetchSchedule,
        lastExecution: now
      };
      await mediaSource.save();
    }
  }
};

// fetchSchedule format
// Fetch every 3 hours example
// cron/userId are required
// {"lastExecution":1565934480,"config":{"cron":"* */3 * * *","userId":1}}
const taskFetchScheduler = async function() {
  const tasks = await Task.findAll({
    attributes: ["id", "projectId", "isFetchScheduled", "fetchSchedule"],
    where: {
      isFetchScheduled: true,
      status: {
        [Op.in]: [Task.STATUS.READY, Task.STATUS.HIDDEN]
      }
    }
  });

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];

    if (!task.fetchSchedule) {
      continue;
    }

    const { lastExecution, config = {} } = task.fetchSchedule;
    const [execute, now] = shouldJobBeExecuted(lastExecution, config.cron);

    if (!config.userId) {
      continue;
    }

    if (execute) {
      await notaJobQueue.add(JobTask.TASK_NAME.TASK_FETCH, {
        projectId: task.projectId,
        resourceId: task.id,
        type: JobTask.TYPE.SCHEDULED,
        data: { refresh: true },
        userId: config.userId
      });

      task.fetchSchedule = {
        ...task.fetchSchedule,
        lastExecution: now
      };
      await task.save();
    }
  }
};

// exportSchedule format
// Export every 3 hours example
// cron/userId are required
// default target is Task.EXPORT_TARGET.NEW_AND_UPDATED
// {"lastExecution":1565934480,"config":{"cron":"* */3 * * *","userId":1, "target": 2}}
const taskExportScheduler = async function() {
  const tasks = await Task.findAll({
    attributes: ["id", "projectId", "isExportScheduled", "exportSchedule"],
    where: {
      isExportScheduled: true,
      status: {
        [Op.notIn]: [
          Task.STATUS.DELETED,
          Task.STATUS.DONE,
          Task.STATUS.CREATING,
          Task.STATUS.CREATING_ERROR
        ]
      }
    }
  });

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];

    if (!task.exportSchedule) {
      continue;
    }

    const { lastExecution, config = {} } = task.exportSchedule;
    const [execute, now] = shouldJobBeExecuted(lastExecution, config.cron);

    if (!config.userId) {
      continue;
    }

    if (execute) {
      await notaJobQueue.add(JobTask.TASK_NAME.TASK_EXPORT, {
        projectId: task.projectId,
        resourceId: task.id,
        type: JobTask.TYPE.SCHEDULED,
        data: { target: config.target || Task.EXPORT_TARGET.NEW_AND_UPDATED },
        userId: config.userId
      });

      task.exportSchedule = {
        ...task.exportSchedule,
        lastExecution: now
      };
      await task.save();
    }
  }
};

const processor = async function(data, done) {
  logger.info({
    logType: "service",
    message: "nota-job-scheduler processing started"
  });

  try {
    // MEDIA_SOURCE_FETCH
    await mediaSourceFetchScheduler();

    // TASK_FETCH
    await taskFetchScheduler();

    // TASK_EXPORT
    await taskExportScheduler();

    done();
  } catch (error) {
    logger.error(error);
    done(error);
  } finally {
    logger.info({
      logType: "service",
      message: "nota-job-scheduler processing finished"
    });
  }
};

module.exports = processor;
