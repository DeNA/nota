"use strict";
module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.createTable("tasks", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.TEXT
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
      task_template_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "task_templates",
          key: "id"
        }
      },
      media_source_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "media_sources",
          key: "id"
        }
      },
      media_source_config: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      status: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      is_fetch_scheduled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      is_export_scheduled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      fetch_schedule: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      export_schedule: {
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
    await queryInterface.addIndex("tasks", {
      fields: ["is_fetch_scheduled"]
    });
    return queryInterface.addIndex("tasks", {
      fields: ["is_export_scheduled"]
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable("tasks");
  }
};
