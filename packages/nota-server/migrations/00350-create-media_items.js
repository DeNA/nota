"use strict";
module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.createTable("media_items", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      media_source_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "media_sources",
          key: "id"
        }
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      path: {
        allowNull: false,
        type: Sequelize.STRING
      },
      metadata: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      /**
       * -100 - DELETED
       * 0 - NOT_FOUND
       * 1 - OK
       */
      status: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 1
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
    return queryInterface.addIndex("media_items", {
      fields: ["media_source_id", "name", "path"]
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable("media_items");
  }
};
