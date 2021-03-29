const { User, sequelize } = require("../models");
const authUtils = require("../lib/authUtils");
const auth = require("../lib/auth");

const userTemplate = function(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    status: user.status,
    authenticator: user.authenticator,
    groups: user.groups.map(group => group.name),
    createdAt: user.createdAt,
    createdBy: user.createdByUser,
    updatedAt: user.updatedAt,
    updatedBy: user.updatedByUser
  };
};
const usersTemplate = function(users) {
  return users.map(userTemplate);
};
const getUsers = async function(req, res, next) {
  try {
    const users = await User.scope("all").findAll();
    res.locals.response = users;
    res.locals.responseTemplate = usersTemplate;
    next();
  } catch (err) {
    next(err);
  }
};

const createUser = async function(req, res, next) {
  try {
    const { username, password, group } = req.body;
    const passwordHash = await authUtils.passwordHash(password);
    const response = await User.create(
      {
        username,
        password: passwordHash,
        group
      },
      {
        fields: ["username", "password", "group"]
      }
    );
    res.json({
      id: response.id
    });
  } catch (err) {
    next(err);
  }
};

const updateUser = async function(req, res, next) {
  try {
    const { status, groups } = req.body;

    const user = await User.scope("all").findByPk(req.params.userId);

    if (!user) {
      const error = new Error("Not found");
      error.status = 404;
      next(error);
      return;
    }

    const updateData = {
      updatedBy: req.user.id
    };
    const updateFields = ["updatedBy"];

    if (status !== undefined) {
      if (
        !req.user.isAppAdmin &&
        (user.isAppAdmin || status === User.STATUS.APP_ADMIN)
      ) {
        const error = new Error("Bad request");
        error.status = 400;
        next(error);
        return;
      }

      updateData.status = status;
      updateFields.push("status");
    }

    await sequelize.transaction(async transaction => {
      await user.update(updateData, {
        fields: updateFields,
        transaction
      });

      if (groups !== undefined) {
        await user.updateGroups(groups, req.user, transaction);
      }

      return user;
    });

    const response = await User.findByPk(req.user.id);
    res.locals.response = response;
    res.locals.responseTemplate = userTemplate;
    next();
  } catch (err) {
    next(err);
  }
};

const meTemplate = function([me, permissions]) {
  return {
    id: me.id,
    username: me.username,
    email: me.email,
    ...permissions
  };
};
const getMe = async function(req, res, next) {
  try {
    const permissions = await req.user.getPermissions();
    res.locals.response = [req.user, permissions];
    res.locals.responseTemplate = meTemplate;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUsers,
  updateUser,
  createUser,
  getMe
};
