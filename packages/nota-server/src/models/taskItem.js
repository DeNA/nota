const { Model, DataTypes } = require("sequelize");
const { annotationDefaultLabels } = require("../lib/utils");

module.exports = function(sequelize) {
  class TaskItem extends Model {}

  TaskItem.STATUS = {
    NOT_DONE: 0,
    DONE: 1
  };

  TaskItem.prototype.isEditableByUser = function(project, task, user) {
    const taskAssignment = this.taskAssignment;

    return (
      taskAssignment.status ===
        sequelize.models.TaskAssignment.STATUS.ANNOTATION_READY &&
      task.canBeAnnotated() &&
      (taskAssignment.annotator === user.id || project.policy(user).canAdmin)
    );
  };

  TaskItem.prototype.createDefaultAnnotations = async function(user) {
    const task = await this.getTask();
    const taskTemplate = await task.getTaskTemplate();
    const annotationsDefinition = taskTemplate.template.annotations || [];
    const autoCreateAnnotations = annotationsDefinition.filter(
      annotationDefinition =>
        annotationDefinition.options && annotationDefinition.options.autoCreate
    );

    for (let i = 0; i < autoCreateAnnotations.length; i++) {
      await this.createAnnotation({
        labelsName: autoCreateAnnotations[i].name,
        labels: annotationDefaultLabels(autoCreateAnnotations[i].labels),
        createdBy: user.id
      });
    }
  };

  TaskItem.init(
    {
      status: DataTypes.INTEGER,
      completedAt: DataTypes.DATE
    },
    {
      sequelize,
      tableName: "task_items",
      underscored: true,
      timestamps: true,
      name: { singular: "taskItem", plural: "taskItems" }
    }
  );

  return function() {
    // SCOPES;
    TaskItem.addScope(
      "defaultScope",
      {
        include: [
          {
            model: sequelize.models.TaskAssignment.scope("forReference")
          }
        ]
      },
      { override: true }
    );
    TaskItem.addScope("withMediaItemData", {
      include: [
        {
          attributes: ["id", "name", "path", "metadata"],
          model: sequelize.models.MediaItem,
          include: [sequelize.models.MediaSource]
        }
      ]
    });
    TaskItem.addScope("withAnnotations", {
      include: [sequelize.models.Annotation]
    });
    TaskItem.addScope("raw", {
      raw: true
    });
    TaskItem.addScope("forLock", {
      attributes: ["id", "status", "taskAssignmentId"]
    });
    TaskItem.belongsTo(sequelize.models.MediaItem, {
      foreignKey: "mediaItemId"
    });
    TaskItem.belongsTo(sequelize.models.TaskAssignment, {
      foreignKey: "taskAssignmentId"
    });

    TaskItem.belongsTo(sequelize.models.Task, {
      foreignKey: "taskId"
    });

    TaskItem.belongsTo(sequelize.models.User, {
      foreignKey: "updatedBy",
      as: "updatedByUser"
    });

    TaskItem.belongsTo(sequelize.models.User, {
      foreignKey: "createdBy",
      as: "createdByUser"
    });

    TaskItem.belongsTo(sequelize.models.User, {
      foreignKey: "completedBy",
      as: "completedByUser"
    });

    TaskItem.hasMany(sequelize.models.Annotation);
  };
};
