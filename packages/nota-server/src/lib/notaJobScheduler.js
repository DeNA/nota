const Bull = require("bull");
const { logger } = require("./logger");
const { redis } = require("../config");

const queueOptions = {
  redis: {
    host: redis.host
  },
  prefix: "nota",
  settings: {
    maxStalledCount: 1
  }
};

const notaJobScheduler = new Bull("job-scheduler", queueOptions);
logger.info({ logType: "service", message: "nota-job-scheduler initialized" });

module.exports = notaJobScheduler;
