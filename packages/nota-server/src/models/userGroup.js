const { Model, DataTypes } = require("sequelize");

module.exports = function(sequelize) {
  class UserGroup extends Model {}
  UserGroup.init(
    {
      name: { type: DataTypes.STRING, primaryKey: true }
    },
    {
      sequelize,
      tableName: "user_groups",
      underscored: true,
      timestamps: true,
      updatedAt: false,
      name: { singular: "group", plural: "groups" }
    }
  );

  return () => {
    // SCOPES
    UserGroup.addScope("forUser", {
      attributes: ["name"]
    });

    // ASSOCIATIONS
    UserGroup.belongsTo(sequelize.models.User, {
      foreignKey: "userId",
      primaryKey: true
    });

    UserGroup.belongsTo(sequelize.models.User, {
      foreignKey: "createdBy",
      as: "createdByUser"
    });
  };
};
