const { Model, DataTypes } = require("sequelize");

module.exports = function(sequelize) {
  class ProjectGroup extends Model {}

  ProjectGroup.TYPE = {
    ANNOTATOR: 100,
    PROJECT_ADMIN: 200
  };

  ProjectGroup.init(
    {
      name: { type: DataTypes.STRING, primaryKey: true },
      type: { type: DataTypes.INTEGER, primaryKey: true }
    },
    {
      sequelize,
      tableName: "project_groups",
      underscored: true,
      timestamps: true,
      updatedAt: false,
      name: { singular: "group", plural: "groups" }
    }
  );

  return () => {
    // SCOPES
    ProjectGroup.addScope("forProject", {
      attributes: ["name", "type"]
    });

    // ASSOCIATIONS
    ProjectGroup.belongsTo(sequelize.models.Project, {
      foreignKey: "projectId",
      primaryKey: true
    });

    ProjectGroup.belongsTo(sequelize.models.User, {
      foreignKey: "createdBy",
      as: "createdByUser"
    });
  };
};
