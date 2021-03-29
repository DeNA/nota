"use strict";
module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.createTable("media_item_tags", {
      media_item_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: "media_items",
          key: "id"
        }
      },
      name: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(191)
      },
      /**
       * 1 - STRING
       * 2 - INTEGER
       * 3 - DATETIME
       */
      type: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      value_string: {
        allowNull: true,
        type: Sequelize.STRING
      },
      value_integer: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      value_datetime: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
    await queryInterface.addIndex("media_item_tags", {
      fields: ["media_item_id", "name", "value_string"]
    });
    await queryInterface.addIndex("media_item_tags", {
      fields: ["media_item_id", "name", "value_integer"]
    });
    return queryInterface.addIndex("media_item_tags", {
      fields: ["media_item_id", "name", "value_datetime"]
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable("media_item_tags");
  }
};
