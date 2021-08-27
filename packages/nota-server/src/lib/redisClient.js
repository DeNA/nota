const Redis = require("ioredis");
const config = require("../config");
const { logger } = require("./logger");

// https://github.com/OptimalBits/bull/issues/1002
Redis.prototype.client = function() {};

module.exports = {
  getRedisClient: () => {
    const redis = new Redis({
      ...config.redis,
      reconnectOnError: error => {
        logger.error(error.message, error);
        const targetErrors = ["READONLY", "ETIMEDOUT", "ENOTFOUND"];

        if (
          targetErrors.some(targetError => error.message.includes(targetError))
        ) {
          return 2;
        }

        return false;
      }
    });
    redis.on("error", error => {
      logger.error(error.message, error);
    });

    return redis;
  }
};
