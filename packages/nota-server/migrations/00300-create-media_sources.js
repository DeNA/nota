"use strict";
module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.createTable("media_sources", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING(191),
        unique: true
      },
      description: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      project_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "projects",
          key: "id"
        }
      },
      datasource: {
        allowNull: false,
        type: Sequelize.STRING
      },
      /**
       * -2 - UPDATING ERROR
       * -1 - CREATING ERROR
       * 0 - CREATING
       * 1 - UPDATING
       * 50 - HIDDEN
       * 100 - READY
       */
      status: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      config: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      is_fetch_scheduled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      fetch_schedule: {
        type: Sequelize.TEXT,
        allowNull: true
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
        allowNull: true,
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
    return queryInterface.addIndex("media_sources", {
      fields: ["is_fetch_scheduled"]
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable("media_sources");
  }
};
