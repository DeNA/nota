const { TaskItem, Op } = require("../models");
const moment = require("moment");
const cache = require("../lib/cache");

const DATE_FORMAT = "YYYYMMDDhhmmss";
const VERSION = "2";

const generateTaskStatusReport = async function(fromDate, toDate) {
  const total = await TaskItem.scope("raw").count({
    where: {
      createdAt: {
        [Op.lte]: toDate.utc()
      }
    },
    group: ["taskId"]
  });

  const totalCompleted = await TaskItem.scope("raw").count({
    where: {
      completedAt: {
        [Op.lte]: toDate.utc()
      }
    },
    group: ["taskId"]
  });

  const added = await TaskItem.scope("raw").count({
    raw: true,
    where: {
      createdAt: {
        [Op.gte]: fromDate.utc(),
        [Op.lte]: toDate.utc()
      }
    },
    group: ["taskId"]
  });

  const completed = await TaskItem.scope("raw").count({
    raw: true,
    where: {
      completedAt: {
        [Op.gte]: fromDate.utc(),
        [Op.lte]: toDate.utc()
      }
    },
    group: ["taskId"]
  });

  return {
    added,
    total,
    totalCompleted,
    completed
  };
};

const taskStatusReport = async function({ from, to, tz, refresh = false }) {
  const fromDate = moment.tz(from, DATE_FORMAT, tz);
  const toDate = moment.tz(to, DATE_FORMAT, tz);
  const now = moment();

  if (!fromDate.isValid()) {
    throw new Error("from date is missing or not valid");
  }

  if (!toDate.isValid()) {
    throw new Error("to date is missing or not valid");
  }

  if (toDate.isSameOrAfter(now) || fromDate.isAfter(toDate)) {
    return {
      added: [],
      total: [],
      totalCompleted: [],
      completed: []
    };
  }

  const key = `nota::report::${VERSION}::taskstatus::all::${from}::${to}::${tz}`;
  const cachedReport = await cache.get(key);
  const report =
    cachedReport || (await generateTaskStatusReport(fromDate, toDate));

  if (!cachedReport) {
    cache.set(key, report);
  }

  return report;
};

const generateTaskAnnotatorReport = async function(fromDate, toDate) {
  const completed = await TaskItem.scope("raw").count({
    raw: true,
    where: {
      completedAt: {
        [Op.gte]: fromDate.utc(),
        [Op.lte]: toDate.utc()
      }
    },
    group: ["taskId", "completedBy"]
  });

  return {
    completed: completed.map(taskAnnotator => ({
      id: taskAnnotator.taskId,
      annotatorId: taskAnnotator.completedBy,
      count: taskAnnotator.count
    }))
  };
};

const taskAnnotatorReport = async function({ from, to, tz, refresh = false }) {
  const fromDate = moment.tz(from, DATE_FORMAT, tz);
  const toDate = moment.tz(to, DATE_FORMAT, tz);
  const now = moment();

  if (!fromDate.isValid()) {
    throw new Error("from date is missing or not valid");
  }

  if (!toDate.isValid()) {
    throw new Error("to date is missing or not valid");
  }

  if (toDate.isSameOrAfter(now) || fromDate.isAfter(toDate)) {
    return {
      completed: []
    };
  }

  const key = `nota::report::${VERSION}::taskannotator::all::${from}::${to}::${tz}`;
  const cachedReport = await cache.get(key);
  const report =
    cachedReport || (await generateTaskAnnotatorReport(fromDate, toDate));

  if (!cachedReport) {
    cache.set(key, report);
  }

  return report;
};

const generateAnnotatorTaskReport = async function(fromDate, toDate) {
  const completed = await TaskItem.scope("raw").count({
    raw: true,
    where: {
      completedAt: {
        [Op.gte]: fromDate.utc(),
        [Op.lte]: toDate.utc()
      }
    },
    group: ["completedBy", "taskId"]
  });

  return {
    completed: completed.map(taskAnnotator => ({
      id: taskAnnotator.taskId,
      annotatorId: taskAnnotator.completedBy,
      count: taskAnnotator.count
    }))
  };
};

const annotatorTaskReport = async function({ from, to, tz, refresh = false }) {
  const fromDate = moment.tz(from, DATE_FORMAT, tz);
  const toDate = moment.tz(to, DATE_FORMAT, tz);
  const now = moment();

  if (!fromDate.isValid()) {
    throw new Error("from date is missing or not valid");
  }

  if (!toDate.isValid()) {
    throw new Error("to date is missing or not valid");
  }

  if (toDate.isSameOrAfter(now) || fromDate.isAfter(toDate)) {
    return {
      completed: []
    };
  }

  const key = `nota::report::${VERSION}::annotatortask::all::${from}::${to}::${tz}`;
  const cachedReport = await cache.get(key);
  const report =
    cachedReport || (await generateAnnotatorTaskReport(fromDate, toDate));

  if (!cachedReport) {
    cache.set(key, report);
  }

  return report;
};

module.exports = {
  taskStatusReport,
  taskAnnotatorReport,
  annotatorTaskReport
};
