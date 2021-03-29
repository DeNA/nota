module.exports = {
  add: () =>
    new Promise((resolve, reject) => {
      setTimeout(() => resolve(true), 50);
    }),
  getRepeatableJobs: () =>
    new Promise((resolve, reject) => {
      setTimeout(() => resolve([]), 50);
    }),
  removeRepeatableByKey: () => {},
  process: () => {}
};
