const { JobTask } = require("../../models");
const queues = {
  [JobTask.TASK_NAME.MEDIA_SOURCE_FETCH]: {
    add: () =>
      new Promise((resolve, reject) => {
        setTimeout(() => resolve(true), 50);
      }),
    process: () => {}
  },
  [JobTask.TASK_NAME.TASK_FETCH]: {
    add: () =>
      new Promise((resolve, reject) => {
        setTimeout(() => resolve(true), 50);
      }),
    process: () => {}
  },
  [JobTask.TASK_NAME.TASK_EXPORT]: {
    add: () =>
      new Promise((resolve, reject) => {
        setTimeout(() => resolve(true), 50);
      }),
    process: () => {}
  }
};

module.exports = {
  add: () =>
    new Promise((resolve, reject) => {
      setTimeout(() => resolve(true), 50);
    }),
  notaJobQueues: queues
};
