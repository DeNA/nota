"use strict";
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable("project_groups", {
      project_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: "projects",
          key: "id"
        }
      },
      name: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(191)
      },
      /**
       * 100 - ANNOTATOR
       * 200 - PROJECT_ADMIN
       */
      type: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      created_by: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "users",
          key: "id"
        }
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable("project_groups");
  }
};
