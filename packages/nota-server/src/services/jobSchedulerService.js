const jobScheduler = require("./jobScheduler");
const notaService = require("./notaService");

module.exports = notaService(
  "nota_common_executor",
  "nota_common_executor",
  () => {},
  {
    repeat: { cron: "*/1 * * * *" },
    processor: jobScheduler
  }
);
