const { Model, DataTypes, Op } = require("sequelize");
const authUtils = require("../lib/authUtils");

module.exports = function(sequelize) {
  class User extends Model {
    get isAppAdmin() {
      return this.status === User.STATUS.APP_ADMIN;
    }
    get isSuperAdmin() {
      return this.isAppAdmin || this.status === User.STATUS.SUPER_ADMIN;
    }
  }

  User.STATUS = {
    NOT_READY_DELETED: 0,
    // Can login, after that group permissions are used to determine scope
    ACTIVE: 1,
    // Can admin all projects and users
    SUPER_ADMIN: 10,
    // Can admin all projects and users, also can create projects and media sources
    APP_ADMIN: 20
  };

  User.prototype.generateUserToken = async function() {
    const token = await authUtils.generateToken();
    const expire = +new Date() + 60 * 60 * 1000 * 24;

    await this.createUserToken({
      token,
      expire
    });

    return [token, expire];
  };

  User.prototype.updateGroups = async function(newGroups, user, transaction) {
    newGroups = Array.from(new Set(newGroups)).filter(
      group => group.length !== 0
    );

    // Delete groups
    for (let i = 0; i < this.groups.length; i++) {
      if (!newGroups.includes(this.groups[i].name)) {
        // Deleting from UserGroup model because of sequelize bug that ignores userId
        await sequelize.models.UserGroup.destroy({
          where: {
            userId: this.id,
            name: this.groups[i].name
          },
          transaction
        });
      }
    }

    // Add new groups
    const currentGroups = this.groups.map(group => group.name);
    for (let i = 0; i < newGroups.length; i++) {
      if (!currentGroups.includes(newGroups[i])) {
        await this.createGroup(
          { name: newGroups[i], createdBy: user.id },
          { transaction }
        );
      }
    }
  };

  User.prototype.getPermissions = async function() {
    const userProjects = await sequelize.models.Project.findAllForUser(this);
    const isProjectAdmin =
      this.isSuperAdmin ||
      userProjects.some(project => project.policy(this).canAdmin);
    const isSuperAdmin = this.isSuperAdmin;
    const isAppAdmin = this.isAppAdmin;

    return { isProjectAdmin, isSuperAdmin, isAppAdmin };
  };

  User.findByUsername = function(username) {
    return this.findOne({
      where: {
        username
      }
    });
  };

  User.findByActiveToken = function(token) {
    return this.findOne({
      include: [
        {
          model: sequelize.models.UserToken,
          where: {
            token,
            expire: {
              [Op.gt]: new Date()
            }
          }
        }
      ]
    });
  };

  User.init(
    {
      username: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      authenticator: DataTypes.STRING,
      status: DataTypes.INTEGER
    },
    {
      sequelize,
      tableName: "users",
      underscored: true,
      timestamps: true,
      name: { singular: "user", plural: "users" }
    }
  );

  return function() {
    // SCOPES
    User.addScope(
      "defaultScope",
      {
        include: [sequelize.models.UserGroup.scope("forUser")],
        where: {
          status: { [Op.not]: User.STATUS.NOT_READY_DELETED }
        }
      },
      { override: true }
    );
    User.addScope("forReference", {
      attributes: ["id", "username"]
    });
    User.addScope("all", {
      include: [sequelize.models.UserGroup.scope("forUser")]
    });
    User.addScope("raw", {
      raw: true
    });

    // ASSOCIATIONS
    User.hasMany(sequelize.models.UserToken);
    User.hasMany(sequelize.models.UserGroup);
  };
};
