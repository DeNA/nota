const Redis = require("ioredis");
const config = require("../config");
const Redlock = require("redlock");
const { logger } = require("./logger");

const redisClient = new Redis({ ...config.redis, lazyConnect: true });
const redlock = new Redlock([redisClient], { retryCount: -1 });

redlock.on("clientError", err => {
  logger.error(err.message, { stack: err.stack });
});

module.exports = redlock;
