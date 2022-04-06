const config = require("./config");

module.exports = {
  apps: [
    {
      name: "nota",
      script: "./bin/www",
      exec_mode: "cluster",
      instances: 0,
      env_dev: {
        NODE_ENV: "development",
        DEBUG: "nota-server:*"
      }
    },
    {
      name: "nota-worker",
      script: "./bin/worker",
      exec_mode: "cluster",
      instances: config.workerClusterInstances ?? 1,
      env_dev: {
        NODE_ENV: "development",
        DEBUG: "nota-server:*"
      }
    }
  ]
};
