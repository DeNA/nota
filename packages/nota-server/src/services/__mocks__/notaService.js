const notaService = function(name, task, processor, scheduler) {
  const service = {
    name,
    get _processor() {
      return jest.fn(async () => {
        return new Promise((resolve, reject) => {
          setTimeout(() => resolve(true), 10);
        });
      });
    },
    add: jest.fn(async () => {})
  };

  return service;
};

module.exports = notaService;
