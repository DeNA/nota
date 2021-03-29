"use strict";
module.exports = {
  up: function(queryInterface, Sequelize) {
    if (queryInterface.sequelize.options.dialect !== "mysql") {
      return queryInterface.sequelize.query(`SELECT 1;`);
    }

    return queryInterface.sequelize.query(
      `ALTER DATABASE ${queryInterface.sequelize.config.database}
        CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;`
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`SELECT 1;`);
  }
};
