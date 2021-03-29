const router = require("express").Router();
const usersApi = require("./routes/users");
const projectsApi = require("./routes/projects");
const mediaSourcesApi = require("./routes/mediaSources");
const taskItemsApi = require("./routes/taskItems");
const tasksApi = require("./routes/tasks");
const taskAssingmentsApi = require("./routes/taskAssignments");
const templatesApi = require("./routes/templates");
const annotationsApi = require("./routes/annotations");
const reportApi = require("./routes/reports");
const {
  Project,
  Task,
  TaskTemplate,
  TaskAssignment,
  MediaSource,
  TaskItem,
  Annotation
} = require("./models");

// Instances prefetch
router.param("projectId", async function(req, res, next, projectId) {
  try {
    const project = await Project.findByPkForUser(projectId, req.user);

    if (!project || !project.policy(req.user).canRead) {
      const err = new Error("Not Found");
      err.status = 404;
      next(err);
      return;
    }

    res.locals.project = project;
    next();
  } catch (error) {
    next(error);
  }
});

router.param("taskId", async function(req, res, next, taskId) {
  try {
    const task = await Task.scope(["defaultScope"]).findByPk(taskId, {
      where: {
        projectId: res.locals.project.id
      }
    });

    if (!task) {
      const err = new Error("Not Found");
      err.status = 404;
      next(err);
      return;
    }

    res.locals.task = task;
    next();
  } catch (error) {
    next(error);
  }
});

router.param("taskTemplateId", async function(req, res, next, taskTemplateId) {
  try {
    const taskTemplate = await TaskTemplate.findByPk(taskTemplateId, {
      where: {
        projectId: res.locals.project.id
      }
    });

    if (!taskTemplate) {
      const err = new Error("Not Found");
      err.status = 404;
      next(err);
      return;
    }

    res.locals.taskTemplate = taskTemplate;
    next();
  } catch (error) {
    next(error);
  }
});

router.param("taskAssignmentId", async function(
  req,
  res,
  next,
  taskAssignmentId
) {
  try {
    const taskAssignment = await TaskAssignment.findByPk(taskAssignmentId, {
      where: {
        projectId: res.locals.project.id,
        taskId: res.locals.task.id
      }
    });

    if (!taskAssignment) {
      const err = new Error("Not Found");
      err.status = 404;
      next(err);
      return;
    }

    res.locals.taskAssignment = taskAssignment;
    next();
  } catch (error) {
    next(error);
  }
});

router.param("mediaSourceId", async function(req, res, next, mediaSourceId) {
  try {
    const mediaSource = await MediaSource.findByPk(mediaSourceId, {
      where: {
        projectId: res.locals.project.id
      }
    });

    if (!mediaSource) {
      const err = new Error("Not Found");
      err.status = 404;
      next(err);
      return;
    }

    res.locals.mediaSource = mediaSource;
    next();
  } catch (error) {
    next(error);
  }
});

router.param("taskItemId", async function(req, res, next, taskItemId) {
  try {
    const taskItem = await TaskItem.findByPk(taskItemId, {
      where: {
        projectId: res.locals.project.id,
        taskId: res.locals.task.id
      }
    });

    if (!taskItem) {
      const err = new Error("Not Found");
      err.status = 404;
      next(err);
      return;
    }

    res.locals.taskItem = taskItem;
    next();
  } catch (error) {
    next(error);
  }
});

router.param("annotationId", async function(req, res, next, annotationId) {
  try {
    const annotation = await Annotation.findByPk(annotationId, {
      where: {
        projectId: res.locals.project.id,
        taskId: res.locals.task.id
      }
    });

    if (!annotation) {
      const err = new Error("Not Found");
      err.status = 404;
      next(err);
      return;
    }

    res.locals.annotation = annotation;
    next();
  } catch (error) {
    next(error);
  }
});

const projectPolicyCheck = function(policy) {
  return function(req, res, next) {
    if (!res.locals.project.policy(req.user)[policy]) {
      const err = new Error("Not Found");
      err.status = 404;
      next(err);
      return;
    }
    next();
  };
};

const projectCanRead = projectPolicyCheck("canRead");
const projectCanAdmin = projectPolicyCheck("canAdmin");
const projectCanSuperAdmin = projectPolicyCheck("canSuperAdmin");

const userCanSuperAdmin = function(req, res, next) {
  if (!req.user.isSuperAdmin) {
    const err = new Error("Not Authorized");
    err.status = 401;
    next(err);
    return;
  }
  next();
};
const userCanAppAdmin = function(req, res, next) {
  if (!req.user.isAppAdmin) {
    const err = new Error("Not Authorized");
    err.status = 401;
    next(err);
    return;
  }
  next();
};

const taskItemEditable = function(req, res, next) {
  if (
    !res.locals.taskItem.isEditableByUser(
      res.locals.project,
      res.locals.task,
      req.user
    )
  ) {
    const err = new Error("Not Authorized");
    err.status = 401;
    next(err);
    return;
  }
  next();
};

// /api Routes
// Projects
router.get("/projects", projectsApi.getProjects);
router.get("/projects/available", projectsApi.getAvailable);
router.get("/projects/:projectId(\\d+)", projectsApi.getProject);
router.get(
  "/projects/:projectId(\\d+)/assignableUsers",
  projectCanAdmin,
  projectsApi.getAssignableUsers
);
router.post("/projects", userCanAppAdmin, projectsApi.createProject);
router.put(
  "/projects/:projectId(\\d+)",
  projectCanAdmin,
  projectsApi.updateProject
);

// Tasks
router.get(
  "/projects/:projectId(\\d+)/tasks",
  projectCanAdmin,
  tasksApi.getTasks
);
router.post(
  "/projects/:projectId(\\d+)/tasks",
  projectCanAdmin,
  tasksApi.createTask
);
router.get(
  "/projects/:projectId(\\d+)/tasks/:taskId(\\d+)",
  projectCanAdmin,
  tasksApi.getTask
);
router.put(
  "/projects/:projectId(\\d+)/tasks/:taskId(\\d+)",
  projectCanAdmin,
  tasksApi.updateTask
);
router.post(
  "/projects/:projectId(\\d+)/tasks/:taskId(\\d+)/refreshTaskItems",
  projectCanAdmin,
  tasksApi.refreshTaskItems
);
router.post(
  "/projects/:projectId(\\d+)/tasks/:taskId(\\d+)/export",
  projectCanAdmin,
  tasksApi.exportTask
);
router.get(
  "/projects/:projectId(\\d+)/tasks/:taskId(\\d+)/download/:exportTaskId(\\d+)",
  projectCanAdmin,
  tasksApi.downloadTask
);
router.delete(
  "/projects/:projectId(\\d+)/tasks/:taskId(\\d+)",
  projectCanAdmin,
  tasksApi.deleteTask
);

// TaskAssignments
router.get(
  "/projects/:projectId(\\d+)/tasks/:taskId(\\d+)/taskAssignments/:taskAssignmentId(\\d+)",
  taskAssingmentsApi.getTaskAssignment
);
router.post(
  "/projects/:projectId(\\d+)/tasks/:taskId(\\d+)/taskAssignments",
  taskAssingmentsApi.createTaskAssignment
);
router.put(
  "/projects/:projectId(\\d+)/tasks/:taskId(\\d+)/taskAssignments/:taskAssignmentId(\\d+)",
  taskAssingmentsApi.updateTaskAssignment
);
router.post(
  "/projects/:projectId(\\d+)/tasks/:taskId(\\d+)/taskAssignments/:taskAssignmentId(\\d+)/returnUnfinishedTaskItems",
  taskAssingmentsApi.returnUnfinishedTaskItems
);

// Task Templates
router.get(
  "/projects/:projectId(\\d+)/taskTemplates",
  projectCanAdmin,
  templatesApi.getTemplates
);
router.post(
  "/projects/:projectId(\\d+)/taskTemplates",
  projectCanAdmin,
  templatesApi.createTemplate
);
router.get(
  "/projects/:projectId(\\d+)/taskTemplates/:taskTemplateId(\\d+)",
  projectCanAdmin,
  templatesApi.getTemplate
);
router.put(
  "/projects/:projectId(\\d+)/taskTemplates/:taskTemplateId(\\d+)",
  projectCanAdmin,
  templatesApi.updateTemplate
);

// Media Sources
router.get(
  "/projects/:projectId(\\d+)/mediaSources",
  projectCanAdmin,
  mediaSourcesApi.getMediaSources
);
router.get(
  "/projects/:projectId(\\d+)/mediaSources/:mediaSourceId(\\d+)",
  projectCanAdmin,
  mediaSourcesApi.getMediaSource
);
router.put(
  "/projects/:projectId(\\d+)/mediaSources/:mediaSourceId(\\d+)",
  projectCanAdmin,
  mediaSourcesApi.updateMediaSource
);
router.post(
  "/projects/:projectId(\\d+)/mediaSources/",
  userCanAppAdmin,
  mediaSourcesApi.createMediaSource
);
router.get(
  "/projects/:projectId(\\d+)/mediaSources/:mediaSourceId(\\d+)/tree",
  projectCanAdmin,
  mediaSourcesApi.getMediaSourceItemsTree
);
router.post(
  "/projects/:projectId(\\d+)/mediaSources/:mediaSourceId(\\d+)/scan",
  projectCanAdmin,
  mediaSourcesApi.scanMediaSourcePath
);
router.post(
  "/projects/:projectId(\\d+)/mediaSources/:mediaSourceId(\\d+)/refreshMediaItems",
  projectCanAdmin,
  mediaSourcesApi.refreshMediaItems
);
router.post(
  "/projects/:projectId(\\d+)/mediaSources/:mediaSourceId(\\d+)/countMediaItems",
  projectCanAdmin,
  mediaSourcesApi.countMediaItems
);

// Task Items
router.get(
  "/projects/:projectId(\\d+)/tasks/:taskId(\\d+)/taskItems/:taskItemId(\\d+)/binary",
  taskItemsApi.getTaskItemBinary
);
router.put(
  "/projects/:projectId(\\d+)/tasks/:taskId(\\d+)/taskItems/:taskItemId(\\d+)",
  taskItemEditable,
  taskItemsApi.updateTaskItem
);
router.post(
  "/projects/:projectId(\\d+)/tasks/:taskId(\\d+)/taskItems/:taskItemId(\\d+)/reset",
  taskItemEditable,
  taskItemsApi.resetTaskItem
);

// Annotations
router.post(
  "/projects/:projectId(\\d+)/tasks/:taskId(\\d+)/taskItems/:taskItemId(\\d+)/annotations",
  taskItemEditable,
  annotationsApi.createAnnotation
);
router.put(
  "/projects/:projectId(\\d+)/tasks/:taskId(\\d+)/taskItems/:taskItemId(\\d+)/annotations/:annotationId(\\d+)",
  taskItemEditable,
  annotationsApi.updateAnnotation
);
router.delete(
  "/projects/:projectId(\\d+)/tasks/:taskId(\\d+)/taskItems/:taskItemId(\\d+)/annotations/:annotationId(\\d+)",
  taskItemEditable,
  annotationsApi.deleteAnnotation
);

// Users
router.get("/users", userCanSuperAdmin, usersApi.getUsers);
router.put("/users/:userId(\\d+)", userCanSuperAdmin, usersApi.updateUser);
router.get("/users/me", usersApi.getMe);

// Report
router.get(
  "/reports/reference/tasks",
  userCanSuperAdmin,
  reportApi.getTasksReference
);
router.get(
  "/reports/tasksStatus",
  userCanSuperAdmin,
  reportApi.getTasksStatusReport
);
router.get(
  "/reports/reference/tasksAnnotators",
  userCanSuperAdmin,
  reportApi.getTasksAnnotatorsReference
);
router.get(
  "/reports/tasksAnnotators",
  userCanSuperAdmin,
  reportApi.getTasksAnnotatorsReport
);
router.get(
  "/reports/reference/annotatorsTasks",
  userCanSuperAdmin,
  reportApi.getAnnotatorsTasksReference
);
router.get(
  "/reports/annotatorsTasks",
  userCanSuperAdmin,
  reportApi.getAnnotatorsTasksReport
);

module.exports = router;
