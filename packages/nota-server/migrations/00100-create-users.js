"use strict";
module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        allowNull: false,
        type: Sequelize.STRING(191),
        unique: true
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING(191),
        unique: true
      },
      password: {
        allowNull: true,
        type: Sequelize.STRING
      },
      /**
       * 0 - NOT_READY / DELETED
       * 1 - READY
       * 2 - SUPER_ADMIN
       */
      status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      /**
       * local - LOCAL
       * okta - SAML (okta)
       */
      authenticator: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "local"
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
    return queryInterface.bulkInsert("users", [
      {
        id: 1,
        username: "admin",
        email: "admin@nota",
        password:
          "$2a$10$4t9WDGV3GN2NooeKz2LeO.vPMAeh548yHZl4.iHHvJLvNsxCm8SFS",
        status: 20, // APP_ADMIN
        authenticator: "local",
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable("users");
  }
};
