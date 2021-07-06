const { Model, DataTypes } = require("sequelize");

module.exports = function(sequelize) {
  class TaskTemplate extends Model {}
  TaskTemplate.init(
    {
      name: DataTypes.TEXT,
      description: DataTypes.TEXT,
      template: {
        type: DataTypes.TEXT,
        get() {
          return this.getDataValue("template")
            ? JSON.parse(this.getDataValue("template"))
            : undefined;
        },
        set(template) {
          this.setDataValue(
            "template",
            template ? JSON.stringify(template) : undefined
          );
        }
      }
    },
    {
      sequelize,
      tableName: "task_templates",
      underscored: true,
      timestamps: true,
      name: { singular: "taskTemplate", plural: "taskTemplates" }
    }
  );
  return function() {
    // SCOPES
    TaskTemplate.addScope(
      "defaultScope",
      {
        include: [
          {
            model: sequelize.models.User.scope("forReference"),
            as: "updatedByUser"
          },
          {
            model: sequelize.models.User.scope("forReference"),
            as: "createdByUser"
          }
        ]
      },
      { override: true }
    );
    TaskTemplate.addScope("full", {
      include: [
        {
          model: sequelize.models.User.scope("forReference"),
          as: "updatedByUser"
        },
        {
          model: sequelize.models.User.scope("forReference"),
          as: "createdByUser"
        }
      ]
    });
    TaskTemplate.addScope("forTask", {
      attributes: ["id", "name", "template"]
    });
    TaskTemplate.addScope("forReference", {
      attributes: ["id", "name"]
    });

    // ASSOCIATIONS
    TaskTemplate.belongsTo(sequelize.models.Project, {
      foreignKey: "projectId"
    });

    TaskTemplate.hasMany(sequelize.models.Task);

    TaskTemplate.belongsTo(sequelize.models.User, {
      foreignKey: "updatedBy",
      as: "updatedByUser"
    });

    TaskTemplate.belongsTo(sequelize.models.User, {
      foreignKey: "createdBy",
      as: "createdByUser"
    });
  };
};
