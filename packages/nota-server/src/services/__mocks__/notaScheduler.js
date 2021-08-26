const notaScheduler = {
  name: "test-nota-scheduler",
  get _processor() {
    return jest.fn(async () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => resolve(true), 10);
      });
    });
  },
  addScheduledTask: jest.fn(async () => {}),
  async start() {},
  async stop() {}
};

module.exports = notaScheduler;
