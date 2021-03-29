"use strict";
module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.createTable("job_tasks", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      project_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "projects",
          key: "id"
        }
      },
      resource_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      /**
       * 1 - MEDIA_SOURCE_FETCH
       * 2 - TASK_FETCH
       * 3 - TASK_EXPORT
       */
      task: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      /**
       * 1 - ADHOC
       * 2 - SCHEDULED
       */
      type: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      /**
       * 0 - NOT_STARTED
       * 1 - ONGOING
       * 10 - OK
       * -1 - ERROR
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
      created_at: {
        allowNull: false,
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
      started_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      finished_at: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
    return queryInterface.addIndex("job_tasks", {
      fields: ["project_id", "resource_id", "task", "created_at"]
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable("job_tasks");
  }
};
