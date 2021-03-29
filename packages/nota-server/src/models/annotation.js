const { Model, DataTypes } = require("sequelize");

module.exports = function(sequelize) {
  class Annotation extends Model {}

  Annotation.STATUS = {
    NOT_DONE: 0,
    DONE: 1
  };

  Annotation.init(
    {
      boundaries: {
        type: DataTypes.TEXT,
        get() {
          return this.getDataValue("boundaries")
            ? JSON.parse(this.getDataValue("boundaries"))
            : undefined;
        },
        set(boundaries) {
          this.setDataValue(
            "boundaries",
            boundaries ? JSON.stringify(boundaries) : undefined
          );
        }
      },
      labels: {
        type: DataTypes.TEXT,
        get() {
          return this.getDataValue("labels")
            ? JSON.parse(this.getDataValue("labels"))
            : undefined;
        },
        set(labels) {
          this.setDataValue(
            "labels",
            labels ? JSON.stringify(labels) : undefined
          );
        }
      },
      labelsName: DataTypes.STRING,
      status: DataTypes.INTEGER
    },
    {
      sequelize,
      tableName: "annotations",
      underscored: true,
      timestamps: true,
      name: { singular: "annotation", plural: "annotations" }
    }
  );

  return function() {
    Annotation.belongsTo(sequelize.models.TaskItem, {
      foreignKey: "taskItemId"
    });

    Annotation.belongsTo(sequelize.models.User, {
      foreignKey: "updatedBy",
      as: "updatedByUser"
    });

    Annotation.belongsTo(sequelize.models.User, {
      foreignKey: "createdBy",
      as: "createdByUser"
    });
  };
};
