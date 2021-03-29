"use strict";
module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.createTable("task_items", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      media_item_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "media_items",
          key: "id"
        }
      },
      task_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "tasks",
          key: "id"
        }
      },
      task_assignment_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "task_assignments",
          key: "id"
        }
      },
      /**
       * 0 - ANNOTATION NOT DONE
       * 1 - ANNOTATION DONE
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
      completed_at: {
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
      },
      completed_by: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: "users",
          key: "id"
        }
      }
    });
    await queryInterface.addIndex("task_items", {
      fields: ["completed_at"]
    });
    await queryInterface.addIndex("task_items", {
      fields: ["created_at"]
    });
    await queryInterface.addIndex("task_items", {
      fields: ["completed_at", "task_id", "completed_by"]
    });
    await queryInterface.addIndex("task_items", {
      fields: ["completed_at", "completed_by", "task_id"]
    });
    return queryInterface.addIndex("task_items", {
      fields: ["created_at", "task_id"]
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable("task_items");
  }
};
