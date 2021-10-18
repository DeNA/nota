const { Model, DataTypes, Op } = require("sequelize");

module.exports = function(sequelize) {
  class Project extends Model {}

  Project.STATUS = {
    NOT_READY: 0,
    READY: 1,
    DELETED: 100
  };

  Project.USER_PERMISSION = {
    ANNOTATOR: 0,
    PROJECT_ADMIN: 10,
    SUPER_ADMIN: 20,
    APP_ADMIN: 30
  };

  Project.prototype.policy = function(user) {
    const allGroups = this.groups;

    return {
      get canRead() {
        const readGroups = allGroups.map(group => group.name);

        return (
          user.isSuperAdmin ||
          user.groups.some(group => readGroups.includes(group.name))
        );
      },
      get canAdmin() {
        const adminGroups = allGroups
          .filter(
            group =>
              group.type === sequelize.models.ProjectGroup.TYPE.PROJECT_ADMIN
          )
          .map(group => group.name);

        return (
          user.isSuperAdmin ||
          user.groups.some(group => adminGroups.includes(group.name))
        );
      },
      get canSuperAdmin() {
        return user.isSuperAdmin;
      }
    };
  };

  Project.prototype.getAssignableUsers = async function() {
    const annotatorGroups = this.groups
      .filter(
        group => group.type === sequelize.models.ProjectGroup.TYPE.ANNOTATOR
      )
      .map(group => group.name);
    const projectAdminGroups = this.groups
      .filter(
        group => group.type === sequelize.models.ProjectGroup.TYPE.PROJECT_ADMIN
      )
      .map(group => group.name);

    const users = (await sequelize.models.User.findAll({
      include: [
        {
          model: sequelize.models.UserGroup.scope("forUser"),
          where: {
            name: {
              [Op.in]: [...annotatorGroups, ...projectAdminGroups]
            }
          }
        }
      ],
      where: {
        status: sequelize.models.User.STATUS.ACTIVE
      }
    })).map(user => {
      user.permission = user.groups.some(group =>
        projectAdminGroups.includes(group.name)
      )
        ? Project.USER_PERMISSION.PROJECT_ADMIN
        : Project.USER_PERMISSION.ANNOTATOR;

      return user;
    });

    const adminUsers = (await sequelize.models.User.findAll({
      where: {
        status: {
          [Op.in]: [
            sequelize.models.User.STATUS.SUPER_ADMIN,
            sequelize.models.User.STATUS.APP_ADMIN
          ]
        }
      }
    })).map(user => {
      user.permission =
        user.status === sequelize.models.User.STATUS.APP_ADMIN
          ? Project.USER_PERMISSION.APP_ADMIN
          : Project.USER_PERMISSION.SUPER_ADMIN;

      return user;
    });

    return [...users, ...adminUsers];
  };

  Project.prototype.updateGroups = async function(
    newGroups,
    user,
    transaction
  ) {
    newGroups = Array.from(new Set(newGroups)).filter(
      group => group.name.length !== 0
    );

    // Delete groups
    for (let i = 0; i < this.groups.length; i++) {
      const currentGroup = this.groups[i];
      if (
        !newGroups.some(
          group =>
            currentGroup.type === group.type && currentGroup.name === group.name
        )
      ) {
        await currentGroup.destroy({ transaction });
      }
    }

    // Add new groups
    for (let i = 0; i < newGroups.length; i++) {
      const newGroup = newGroups[i];
      if (
        !this.groups.some(
          group => newGroup.type === group.type && newGroup.name === group.name
        )
      ) {
        await this.createGroup(
          { name: newGroup.name, type: newGroup.type, createdBy: user.id },
          { transaction }
        );
      }
    }
  };

  Project.findByPkForUser = function(id, user, options = {}) {
    if (user.isSuperAdmin) {
      return this.scope(["defaultScope", "notDeleted"]).findByPk(id, options);
    }

    return this.scope(["defaultScope", "ready"]).findByPk(id, options);
  };

  Project.findAllForUser = function(user, options = {}) {
    if (user.isSuperAdmin) {
      return this.scope(["defaultScope", "notDeleted"]).findAll(options);
    }

    const subquery = sequelize.dialect.QueryGenerator.selectQuery(
      sequelize.models.ProjectGroup.tableName,
      {
        attributes: ["project_id"],
        where: {
          name: {
            [Op.in]: user.groups.map(group => group.name)
          }
        }
      }
    ).slice(0, -1);

    return this.scope(["defaultScope", "ready"]).findAll({
      ...options,
      where: {
        id: {
          [Op.in]: sequelize.literal(`(${subquery})`)
        }
      }
    });
  };

  Project.findAvailableForUser = async function(user, options = {}) {
    const include = [
      sequelize.models.ProjectGroup.scope("forProject"),
      {
        model: sequelize.models.Task,
        required: false,
        attributes: ["id", "name", "description", "status"],
        where: {
          status: {
            [Op.notIn]: [
              sequelize.models.Task.STATUS.DELETED,
              sequelize.models.Task.STATUS.CREATING_ERROR,
              sequelize.models.Task.STATUS.DONE
            ]
          }
        },
        include: [
          {
            required: false,
            model: sequelize.models.TaskAssignment,
            attributes: ["id", "status"],
            where: {
              annotator: user.id
            }
          }
        ]
      }
    ];

    const query = { ...options, include };

    if (!user.isSuperAdmin) {
      const subquery = sequelize.dialect.QueryGenerator.selectQuery(
        sequelize.models.ProjectGroup.tableName,
        {
          attributes: ["project_id"],
          where: {
            name: {
              [Op.in]: user.groups.map(group => group.name)
            }
          }
        }
      ).slice(0, -1);

      query.where = {
        id: {
          [Op.in]: sequelize.literal(`(${subquery})`)
        }
      };
    }
    const allAvailableProjects = await this.scope(["ready"]).findAll(query);

    // Filter out hidden for non-admin users
    const projects = allAvailableProjects.filter(project => {
      const tasks = (project.tasks || []).filter(task => {
        if (task.status !== sequelize.models.Task.STATUS.HIDDEN) return true;

        return project.policy(user).canAdmin;
      });

      project.tasks = tasks;

      return tasks.length > 0;
    });

    const taskIds = [];
    const taskAssignmentIds = [];
    projects.forEach(project => {
      (project.tasks || []).forEach(task => {
        taskIds.push(task.id);

        (task.taskAssignments || []).forEach(taskAssignment => {
          taskAssignmentIds.push(taskAssignment.id);
        });
      });
    });
    const tasks = taskIds.length
      ? await sequelize.models.Task.scope(["withTaskItemsCount"]).findAll({
          where: {
            id: taskIds
          }
        })
      : [];
    const taskAssignments = taskAssignmentIds.length
      ? await sequelize.models.TaskAssignment.scope([
          "withTaskItemsCount"
        ]).findAll({
          where: {
            id: taskAssignmentIds
          }
        })
      : [];

    return [projects, tasks, taskAssignments];
  };

  Project.init(
    {
      name: DataTypes.STRING,
      status: DataTypes.INTEGER
    },
    {
      sequelize,
      tableName: "projects",
      underscored: true,
      timestamps: true,
      name: { singular: "project", plural: "projects" }
    }
  );

  return function() {
    // SCOPES
    Project.addScope(
      "defaultScope",
      {
        include: [
          sequelize.models.ProjectGroup.scope("forProject"),
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
    Project.addScope("ready", {
      where: {
        status: Project.STATUS.READY
      }
    });
    Project.addScope("notDeleted", {
      where: {
        status: {
          [Op.ne]: Project.STATUS.DELETED
        }
      }
    });
    Project.addScope("forReference", {
      attributes: ["id", "name"]
    });
    Project.addScope("all", {
      include: [sequelize.models.ProjectGroup.scope("forProject")]
    });
    Project.addScope("raw", {
      raw: true
    });

    // ASSOCIATIONS
    Project.hasMany(sequelize.models.Task);
    Project.hasMany(sequelize.models.TaskTemplate);
    Project.hasMany(sequelize.models.MediaSource);
    Project.hasMany(sequelize.models.ProjectGroup);
    Project.hasMany(sequelize.models.JobTask);
    Project.belongsTo(sequelize.models.User, {
      as: "updatedByUser",
      foreignKey: "updatedBy"
    });
    Project.belongsTo(sequelize.models.User, {
      as: "createdByUser",
      foreignKey: "createdBy"
    });
  };
};
