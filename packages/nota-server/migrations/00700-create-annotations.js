"use strict";
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable("annotations", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      task_item_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "task_items",
          key: "id"
        }
      },
      boundaries: {
        type: Sequelize.TEXT("medium")
      },
      labels: {
        type: Sequelize.TEXT("medium")
      },
      labels_name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      /**
       * 0 - ANNOTATION NOT CHECKED
       * 1 - ANNOTATION CHECKED
       */
      status: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      created_by: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "users",
          key: "id"
        }
      },
      updated_by: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: "users",
          key: "id"
        }
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable("annotations");
  }
};
