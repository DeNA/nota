const { Model, DataTypes, Op } = require("sequelize");

module.exports = function(sequelize) {
  class TaskAssignment extends Model {}

  TaskAssignment.STATUS = {
    ERROR: -1,
    CREATING: 0,
    ANNOTATION_READY: 100,
    DONE: 500
  };

  TaskAssignment.prototype.assignTaskItems = async function(
    size,
    random,
    user,
    transaction
  ) {
    const taskItems = await sequelize.models.TaskItem.scope("forLock").findAll({
      where: {
        taskId: this.taskId,
        taskAssignmentId: null
      },
      order: random ? sequelize.random() : undefined,
      limit: size,
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    const taskItemIds = taskItems.map(taskItem => taskItem.id);

    if (!taskItemIds.length) {
      return false;
    }

    await sequelize.models.TaskItem.update(
      {
        taskAssignmentId: this.id,
        updatedBy: user.id
      },
      {
        where: {
          id: {
            [Op.in]: taskItemIds
          }
        },
        transaction
      }
    );

    this.status = TaskAssignment.STATUS.ANNOTATION_READY;
    await this.save({ transaction });
    return true;
  };

  TaskAssignment.prototype.returnUnfinishedTaskItems = async function(
    user,
    transaction
  ) {
    await sequelize.models.TaskItem.update(
      {
        taskAssignmentId: null,
        updatedBy: user.id
      },
      {
        where: {
          taskAssignmentId: this.id,
          status: {
            [Op.not]: sequelize.models.TaskItem.STATUS.DONE
          }
        },
        transaction
      }
    );

    const taskItems = await sequelize.models.TaskItem.scope("forLock").findAll({
      where: {
        taskAssignmentId: this.id
      },
      transaction
    });

    if (!taskItems.length) {
      await this.destroy({ transaction });
    }
  };

  TaskAssignment.init(
    {
      status: DataTypes.INTEGER
    },
    {
      sequelize,
      tableName: "task_assignments",
      underscored: true,
      timestamps: true,
      name: { singular: "taskAssignment", plural: "taskAssignments" }
    }
  );

  return function() {
    // SCOPES
    TaskAssignment.addScope(
      "defaultScope",
      {
        include: [
          {
            model: sequelize.models.User.scope("forReference"),
            as: "annotatorUser"
          }
        ]
      },
      { override: true }
    );
    TaskAssignment.addScope(
      "onlyDone",
      {
        attributes: ["id"],
        where: {
          status: sequelize.models.TaskAssignment.STATUS.DONE
        }
      },
      { override: true }
    );
    TaskAssignment.addScope(
      "forReference",
      {
        attributes: ["id", "annotator", "status"]
      },
      { override: true }
    );
    TaskAssignment.addScope("withTaskItemsCount", {
      attributes: {
        include: [
          [sequelize.fn("count", sequelize.col("taskItems.id")), "total"],
          [
            sequelize.fn(
              "sum",
              sequelize.literal(
                `CASE WHEN taskItems.status = 1 THEN 1 ELSE 0 END`
              )
            ),
            "done"
          ]
        ]
      },
      include: [
        {
          attributes: ["id", "status"],
          model: sequelize.models.TaskItem
        }
      ],
      group: ["TaskAssignment.id"]
    });
    TaskAssignment.addScope("forAnnotation", {
      include: [
        {
          model: sequelize.models.User.scope("forReference"),
          as: "annotatorUser",
          required: true
        },
        {
          model: sequelize.models.Task.scope("forReference"),
          include: [
            {
              model: sequelize.models.TaskTemplate.scope("forReference"),
              attributes: ["id", "name", "template"],
              required: true
            },
            {
              model: sequelize.models.Project.scope("forReference"),
              attributes: ["id", "name"],
              required: true
            }
          ],
          required: true
        }
      ]
    });

    // ASSOCIATIONS
    TaskAssignment.belongsTo(sequelize.models.Task, {
      foreignKey: "taskId"
    });

    TaskAssignment.hasMany(sequelize.models.TaskItem);

    TaskAssignment.belongsTo(sequelize.models.User, {
      as: "annotatorUser",
      foreignKey: "annotator"
    });

    TaskAssignment.belongsTo(sequelize.models.User, {
      foreignKey: "updatedBy"
    });

    TaskAssignment.belongsTo(sequelize.models.User, {
      foreignKey: "createdBy"
    });
  };
};
