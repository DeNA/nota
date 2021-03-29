const { Project, sequelize } = require("../models");
const { compareIds } = require("../lib/utils");

const projectsTemplate = function(projects) {
  return projects.sort(compareIds).map(p => ({
    id: p.id,
    name: p.name,
    status: p.status
  }));
};
const getProjects = async function(req, res, next) {
  try {
    const projects = await Project.findAllForUser(req.user);
    res.locals.response = projects;
    res.locals.responseTemplate = projectsTemplate;
    next();
  } catch (err) {
    next(err);
  }
};

const projectTemplate = function(project) {
  return {
    id: project.id,
    name: project.name,
    status: project.status,
    groups: project.groups,
    createdAt: project.createdAt,
    createdBy: project.createdByUser,
    updatedAt: project.updatedAt,
    updatedBy: project.updatedByUser
  };
};
const getProject = async function(req, res, next) {
  res.locals.response = res.locals.project;
  res.locals.responseTemplate = projectTemplate;
  next();
};

const availableTemplate = function([projects, tasks, taskAssignments]) {
  return projects.map(project => ({
    id: project.id,
    name: project.name,
    tasks: project.tasks.map(task => {
      const taskTotal = tasks.find(taskTotal => taskTotal.id === task.id);

      return {
        id: task.id,
        name: task.name,
        description: task.description,
        status: task.status,
        assignable:
          parseInt(taskTotal.get("total")) > 0
            ? parseInt(taskTotal.get("assignable"))
            : 0,
        done: parseInt(taskTotal.get("done")),
        total: parseInt(taskTotal.get("total")),
        assignments: task.taskAssignments.map(assignment => {
          const taskAssignmentTotal = taskAssignments.find(
            taskAssignmentTotal => taskAssignmentTotal.id === assignment.id
          );

          return {
            id: assignment.id,
            annotator: assignment.annotatorUser,
            status: assignment.status,
            done: parseInt(taskAssignmentTotal.get("done")),
            total: parseInt(taskAssignmentTotal.get("total"))
          };
        })
      };
    })
  }));
};
const getAvailable = async function(req, res, next) {
  try {
    const available = await Project.findAvailableForUser(req.user);

    res.locals.response = available;
    res.locals.responseTemplate = availableTemplate;
    next();
  } catch (error) {
    next(error);
  }
};

const createProject = async function(req, res, next) {
  const { name } = req.body;

  try {
    const project = await Project.create({
      name,
      status: Project.STATUS.READY,
      createdBy: req.user.id,
      updatedBy: req.user.id
    });

    const response = await Project.findByPk(project.id);
    res.locals.response = response;
    res.locals.responseTemplate = projectTemplate;
    next();
  } catch (error) {
    next(error);
  }
};

const updateProject = async function(req, res, next) {
  try {
    const { name, status, groups } = req.body;

    const updateData = {
      updatedBy: req.user.id
    };
    const updateFields = ["updatedBy"];

    if (name !== undefined) {
      updateData.name = name;
      updateFields.push("name");
    }

    if (status !== undefined) {
      updateData.status = status;
      updateFields.push("status");
    }

    await sequelize.transaction(async transaction => {
      await res.locals.project.update(updateData, {
        fields: updateFields,
        transaction
      });

      if (groups !== undefined) {
        await res.locals.project.updateGroups(groups, req.user, transaction);
      }

      return res.locals.project;
    });

    const response = await Project.findByPk(res.locals.project.id);
    res.locals.response = response;
    res.locals.responseTemplate = projectTemplate;
    next();
  } catch (err) {
    next(err);
  }
};

const assignableUsersTemplate = function(users) {
  return users.map(user => ({
    id: user.id,
    username: user.username,
    permission: user.permission
  }));
};

const getAssignableUsers = async function(req, res, next) {
  try {
    const users = await res.locals.project.getAssignableUsers();

    res.locals.response = users;
    res.locals.responseTemplate = assignableUsersTemplate;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProject,
  getAvailable,
  createProject,
  updateProject,
  getAssignableUsers
};
