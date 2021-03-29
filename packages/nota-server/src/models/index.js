const { Sequelize, Op } = require("sequelize");
const config = require("../config/db");

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  { ...config }
);

[
  require("./userGroup")(sequelize),
  require("./user")(sequelize),
  require("./annotation")(sequelize),
  require("./mediaItem")(sequelize),
  require("./mediaItemTag")(sequelize),
  require("./projectGroup")(sequelize),
  require("./taskTemplate")(sequelize),
  require("./mediaSource")(sequelize),
  require("./project")(sequelize),
  require("./task")(sequelize),
  require("./taskAssignment")(sequelize),
  require("./taskItem")(sequelize),
  require("./userToken")(sequelize),
  require("./jobTask")(sequelize)
].forEach(model => model());

// sequelize.sync();

module.exports = { sequelize, ...sequelize.models, Op };
