const { Model, DataTypes } = require("sequelize");

module.exports = function(sequelize) {
  class JobTask extends Model {}

  JobTask.TASK = {
    MEDIA_SOURCE_FETCH: 1,
    TASK_FETCH: 2,
    TASK_EXPORT: 3
  };
  JobTask.TASK_NAME = {
    MEDIA_SOURCE_FETCH: "MEDIA_SOURCE_FETCH",
    TASK_FETCH: "TASK_FETCH",
    TASK_EXPORT: "TASK_EXPORT"
  };

  JobTask.TYPE = {
    ADHOC: 1,
    SCHEDULED: 2
  };

  JobTask.STATUS = {
    NOT_STARTED: 0,
    ONGOING: 1,
    OK: 10,
    ERROR: -1
  };

  JobTask.init(
    {
      resourceId: DataTypes.INTEGER,
      task: DataTypes.INTEGER,
      type: DataTypes.INTEGER,
      status: DataTypes.INTEGER,
      config: {
        type: DataTypes.TEXT,
        get() {
          return this.getDataValue("config")
            ? JSON.parse(this.getDataValue("config"))
            : undefined;
        },
        set(config) {
          this.setDataValue(
            "config",
            config ? JSON.stringify(config) : undefined
          );
        }
      },
      startedAt: DataTypes.DATE,
      finishedAt: DataTypes.DATE
    },
    {
      sequelize,
      tableName: "job_tasks",
      underscored: true,
      timestamps: true,
      updatedAt: false,
      name: { singular: "jobTask", plural: "jobTasks" }
    }
  );

  return () => {
    // SCOPES

    // ASSOCIATIONS
    JobTask.belongsTo(sequelize.models.Project, {
      foreignKey: "projectId"
    });

    JobTask.belongsTo(sequelize.models.User, {
      foreignKey: "createdBy",
      as: "createdByUser"
    });
  };
};
