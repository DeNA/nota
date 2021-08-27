const { db } = require("./src/lib/testUtils");

module.exports = async () => {
  await db.setupDb();
};
