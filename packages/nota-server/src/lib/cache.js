const Redis = require("ioredis");
const config = require("../config").redis;

const redis = new Redis(config);

module.exports = {
  get: async function(key) {
    const value = await redis.get(key);

    return value ? JSON.parse(value) : null;
  },
  set: async function(key, value) {
    return redis.set(key, JSON.stringify(value));
  },
  del: async function(key) {
    return redis.del(key);
  }
};
