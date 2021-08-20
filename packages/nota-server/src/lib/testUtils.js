const {
  User,
  UserToken,
  UserGroup,
  Project,
  ProjectGroup,
  TaskTemplate,
  Task,
  TaskAssignment,
  MediaItem,
  MediaSource,
  TaskItem,
  JobTask
} = require("../models");
const authUtils = require("./authUtils");
const { spawn } = require("child-process-promise");
// const fs = require("fs");
// const config = require("../config");

const resetTestDb = async () => {
  const options = { stdio: "inherit" };
  const sequelize = "node_modules/.bin/sequelize";
  try {
    // fs.unlinkSync("./" + config.db.storage);
    await spawn(sequelize, ["db:migrate:undo:all"]);
    await spawn(sequelize, ["db:migrate"]);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const createProject = async ({
  name = "sample project",
  status = Project.STATUS.READY,
  createdBy = 1,
  updatedBy = 1,
  groups = []
}) => {
  const project = await Project.create(
    {
      name,
      status,
      createdBy,
      updatedBy,
      groups: groups.map(({ name, type, createdBy = 1, updatedBy = 1 }) => {
        return {
          name,
          type,
          createdBy,
          updatedBy
        };
      })
    },
    { include: [ProjectGroup] }
  );

  return project.get({ plain: true });
};

const createUser = async ({
  username = "user",
  email = "user@nota.local",
  password = "password",
  token = Math.random().toString(),
  status = 1,
  groups = []
}) => {
  const user = await User.create(
    {
      username,
      email,
      password: await authUtils.passwordHash(password),
      status,
      groups: groups.map(({ name, createdBy = 1, updatedBy = 1 }) => ({
        name,
        createdBy,
        updatedBy
      })),
      userTokens: [
        {
          token,
          expire: new Date(+new Date() + 1000 * 60 * 60)
        }
      ]
    },
    { include: [UserGroup, UserToken] }
  );

  return user.get({ plain: true });
};

const createMediaSource = async ({
  name = "mediaSource",
  description = "media source description",
  projectId = 1,
  datasource = "file",
  status = MediaSource.STATUS.READY,
  config = {},
  createdBy = 1,
  updatedBy = 1
}) => {
  const mediaSource = await MediaSource.create({
    name,
    description,
    projectId,
    datasource,
    status,
    config,
    createdBy,
    updatedBy
  });

  return mediaSource.get({ plain: true });
};

const createTaskTemplate = async ({
  name = "template",
  description = "template_description",
  projectId = 1,
  template = {},
  createdBy = 1,
  updatedBy = 1
}) => {
  const taskTemplate = await TaskTemplate.create({
    name,
    description,
    projectId,
    template,
    createdBy,
    updatedBy
  });

  return taskTemplate.get({ plain: true });
};

const createTask = async ({
  name = "task",
  description = "description",
  projectId = 1,
  taskTemplateId = 1,
  mediaSourceId = 1,
  mediaSourceConfig = {
    options: { path: "files1", excludeAlreadyUsed: true, limit: 5000 },
    conditions: { filter_string: "foo", filter_integer: [0, 10] }
  },
  status = 100,
  createdBy = 1,
  updatedBy = 1
}) => {
  const task = await Task.create({
    name,
    description,
    projectId,
    taskTemplateId,
    mediaSourceId,
    mediaSourceConfig,
    status,
    createdBy,
    updatedBy
  });

  return task.get({ plain: true });
};

const createTaskAssignment = async ({
  taskId = 1,
  status = 100,
  annotator = null,
  createdBy = 1,
  updatedBy = 1
}) => {
  const taskAssignment = await TaskAssignment.create({
    taskId,
    status,
    annotator,
    createdBy,
    updatedBy
  });

  return taskAssignment.get({ plain: true });
};

const createMediaItem = async ({
  name = "media_item",
  path = null,
  mediaSourceId = null,
  metadata = {},
  status = 1,
  createdBy = 1,
  updatedBy = 1
}) => {
  const mediaItem = await MediaItem.create({
    name,
    path,
    mediaSourceId,
    metadata,
    status,
    createdBy,
    updatedBy
  });

  return mediaItem.get({ plain: true });
};

const createTaskItem = async ({
  name = "test_item",
  mediaItemId = null,
  taskId = null,
  taskAssignmentId = null,
  status = 0,
  createdBy = 1,
  updatedBy = 1
}) => {
  const mediaItem = await TaskItem.create({
    name,
    mediaItemId,
    taskId,
    taskAssignmentId,
    status,
    createdBy,
    updatedBy
  });

  return mediaItem.get({ plain: true });
};

const createJobTask = async ({
  projectId,
  resourceId,
  task,
  type = JobTask.TYPE.ADHOC,
  status = JobTask.STATUS.NOT_STARTED,
  config,
  startedAt = null,
  finishedAt = null,
  createdBy = 1,
  updatedBy = 1
}) => {
  const jobTask = await JobTask.create({
    projectId,
    resourceId,
    task,
    type,
    status,
    config,
    startedAt,
    finishedAt,
    createdBy,
    updatedBy
  });

  return jobTask.get({ plain: true });
};

const generateTestData = async function() {
  // users
  const normalUser = await createUser({
    username: "normal_user",
    email: "normal_user@nota.local",
    groups: [{ name: "normal_user" }]
  });
  const annotatorUser = await createUser({
    username: "annotator_user",
    email: "annotator_user@nota.local",
    groups: [{ name: "annotator_group" }]
  });
  const adminUser = await createUser({
    username: "admin_user",
    email: "admin_user@nota.local",
    groups: [{ name: "admin_group" }]
  });
  const superadminUser = await createUser({
    username: "superadmin_user",
    email: "superadmin_user@nota.local",
    status: User.STATUS.SUPER_ADMIN
  });
  const appadminUser = await createUser({
    username: "appadmin_user",
    email: "appadmin_user@nota.local",
    status: User.STATUS.APP_ADMIN
  });
  const differentAdminUser = await createUser({
    username: "different_admin_user",
    email: "different_admin_user@nota.local",
    groups: [{ name: "different_admin_group" }]
  });

  // projects
  const project1 = await createProject({
    name: "project_1",
    status: Project.STATUS.READY,
    groups: [
      { name: "admin_group", type: ProjectGroup.TYPE.PROJECT_ADMIN },
      { name: "annotator_group", type: ProjectGroup.TYPE.ANNOTATOR }
    ]
  });
  const project2 = await createProject({
    name: "project_2",
    status: Project.STATUS.READY,
    groups: [
      { name: "admin_group", type: ProjectGroup.TYPE.PROJECT_ADMIN },
      { name: "annotator_group", type: ProjectGroup.TYPE.ANNOTATOR }
    ]
  });
  const project3 = await createProject({
    name: "project_3",
    status: Project.STATUS.READY,
    groups: [
      { name: "different_admin_group", type: ProjectGroup.TYPE.PROJECT_ADMIN },
      {
        name: "different_annotator_group",
        type: ProjectGroup.TYPE.ANNOTATOR
      }
    ]
  });
  const project4 = await createProject({
    name: "project_4",
    status: Project.STATUS.NOT_READY,
    groups: [
      { name: "admin_group", type: ProjectGroup.TYPE.PROJECT_ADMIN },
      { name: "annotator_group", type: ProjectGroup.TYPE.ANNOTATOR }
    ]
  });
  const project5 = await createProject({
    name: "project_5",
    status: Project.STATUS.DELETED,
    groups: [
      { name: "admin_group", type: ProjectGroup.TYPE.PROJECT_ADMIN },
      { name: "annotator_group", type: ProjectGroup.TYPE.ANNOTATOR }
    ]
  });

  // media_sources
  const mediaSource1 = await createMediaSource({
    name: "media_source 1",
    description: "media_source 1 description",
    projectId: project1.id,
    datasource: "s3",
    status: MediaSource.STATUS.READY,
    config: {
      extensions: ["jpg", "png"],
      bucket: "dummy-bucket",
      path: "input",
      exportPath: "output",
      filters: [
        { name: "filter_string", label: "String", type: 1 },
        { name: "filter_integer", label: "Integer", type: 2 },
        { name: "filter_date", label: "Date", type: 3 }
      ]
    }
  });
  const mediaSource2 = await createMediaSource({
    name: "media_source 2",
    description: "media_source 2 description",
    projectId: project1.id,
    datasource: "file",
    status: MediaSource.STATUS.READY,
    config: {}
  });
  const mediaSource3 = await createMediaSource({
    name: "media_source 3",
    description: "media_source 3 description",
    projectId: project2.id,
    datasource: "file",
    status: MediaSource.STATUS.READY,
    config: {}
  });

  // task_templates
  const template1 = await createTaskTemplate({
    name: "template_1",
    projectId: project1.id,
    template: { parser: "json", foo: "bar" }
  });
  const template2 = await createTaskTemplate({
    name: "template_2",
    projectId: project1.id,
    template: { parser: "json" }
  });
  const template3 = await createTaskTemplate({
    name: "template_3",
    projectId: project1.id,
    template: { parser: "json" }
  });
  const template4 = await createTaskTemplate({
    name: "template_4",
    projectId: project3.id,
    template: { parser: "json" }
  });

  // tasks
  const task1 = await createTask({
    name: "task_1",
    projectId: project1.id,
    taskTemplateId: template1.id,
    mediaSourceId: mediaSource1.id,
    mediaSourceConfig: {
      options: { path: "files1", excludeAlreadyUsed: true, limit: 5000 },
      conditions: { filter_string: "foo", filter_integer: [0, 10] }
    },
    status: 100,
    createdBy: adminUser.id,
    updatedBy: adminUser.id
  });
  const task2 = await createTask({
    name: "task_2",
    projectId: project1.id,
    taskTemplateId: template1.id,
    mediaSourceId: mediaSource1.id,
    mediaSourceConfig: { options: { path: "files1" } },
    status: 100,
    createdBy: adminUser.id,
    updatedBy: adminUser.id
  });
  const task3 = await createTask({
    name: "task_3_done",
    projectId: project1.id,
    taskTemplateId: template1.id,
    mediaSourceId: mediaSource1.id,
    mediaSourceConfig: { options: { path: "files1" } },
    status: 500,
    createdBy: adminUser.id,
    updatedBy: adminUser.id
  });
  const task4 = await createTask({
    name: "task_4_hidden",
    projectId: project1.id,
    taskTemplateId: template1.id,
    mediaSourceId: mediaSource1.id,
    mediaSourceConfig: { options: { path: "files1" } },
    status: 50,
    createdBy: adminUser.id,
    updatedBy: adminUser.id
  });

  //taskAssignments
  const taskAssignment1 = await createTaskAssignment({
    taskId: task1.id,
    annotator: annotatorUser.id,
    status: TaskAssignment.STATUS.DONE,
    createdBy: adminUser.id,
    updatedBy: adminUser.id
  });
  const taskAssignment2 = await createTaskAssignment({
    taskId: task1.id,
    annotator: annotatorUser.id,
    status: TaskAssignment.STATUS.ANNOTATION_READY,
    createdBy: adminUser.id,
    updatedBy: adminUser.id
  });

  //mediaItems
  const mediaItem1 = await createMediaItem({
    name: "media_item_1.jpg",
    path: "aaa",
    mediaSourceId: mediaSource1.id,
    status: MediaItem.STATUS.OK,
    createdBy: adminUser.id,
    updatedBy: annotatorUser.id
  });
  const mediaItem2 = await createMediaItem({
    name: "media_item_2.jpg",
    path: "aaa/bbb",
    mediaSourceId: mediaSource1.id,
    status: MediaItem.STATUS.OK,
    createdBy: adminUser.id,
    updatedBy: annotatorUser.id
  });
  const mediaItem3 = await createMediaItem({
    name: "media_item_3.jpg",
    path: "aaa/bbb",
    mediaSourceId: mediaSource1.id,
    status: MediaItem.STATUS.OK,
    createdBy: adminUser.id,
    updatedBy: annotatorUser.id
  });
  const mediaItem4 = await createMediaItem({
    name: "media_item_4.jpg",
    path: "aaa/bbb/ccc",
    mediaSourceId: mediaSource1.id,
    status: MediaItem.STATUS.OK,
    createdBy: adminUser.id,
    updatedBy: annotatorUser.id
  });
  const mediaItem5 = await createMediaItem({
    name: "media_item_5.jpg",
    path: "aaa/bbb/ccc/ddd",
    mediaSourceId: mediaSource1.id,
    status: MediaItem.STATUS.OK,
    createdBy: adminUser.id,
    updatedBy: annotatorUser.id
  });
  const mediaItem6 = await createMediaItem({
    name: "media_item_6.jpg",
    path: "aaa/bbb/ccc/ddd",
    mediaSourceId: mediaSource1.id,
    status: MediaItem.STATUS.OK,
    createdBy: adminUser.id,
    updatedBy: annotatorUser.id
  });

  // Task Item
  const taskItem1 = await createTaskItem({
    mediaItemId: mediaItem1.id,
    taskId: task1.id,
    taskAssignmentId: taskAssignment1.id,
    status: TaskItem.STATUS.DONE,
    createdBy: adminUser.id,
    updatedBy: annotatorUser.id
  });
  const taskItem2 = await createTaskItem({
    mediaItemId: mediaItem2.id,
    taskId: task1.id,
    taskAssignmentId: taskAssignment1.id,
    status: TaskItem.STATUS.DONE,
    createdBy: adminUser.id,
    updatedBy: annotatorUser.id
  });
  const taskItem3 = await createTaskItem({
    mediaItemId: mediaItem3.id,
    taskId: task1.id,
    taskAssignmentId: taskAssignment2.id,
    status: TaskItem.STATUS.NOT_DONE,
    createdBy: adminUser.id,
    updatedBy: annotatorUser.id
  });
  const taskItem4 = await createTaskItem({
    mediaItemId: mediaItem4.id,
    taskId: task1.id,
    taskAssignmentId: taskAssignment2.id,
    status: TaskItem.STATUS.NOT_DONE,
    createdBy: adminUser.id,
    updatedBy: annotatorUser.id
  });
  const taskItem5 = await createTaskItem({
    mediaItemId: mediaItem5.id,
    taskId: task1.id,
    taskAssignmentId: null,
    status: TaskItem.STATUS.NOT_DONE,
    createdBy: adminUser.id,
    updatedBy: annotatorUser.id
  });
  const taskItem6 = await createTaskItem({
    mediaItemId: mediaItem6.id,
    taskId: task1.id,
    taskAssignmentId: null,
    status: TaskItem.STATUS.NOT_DONE,
    createdBy: adminUser.id,
    updatedBy: annotatorUser.id
  });

  // Job Tasks
  const jobTask_taskFetch1 = await createJobTask({
    projectId: task1.projectId,
    resourceId: task1.id,
    task: JobTask.TASK.TASK_FETCH,
    type: JobTask.TYPE.SCHEDULED,
    status: JobTask.STATUS.NOT_STARTED,
    config: { data: { refresh: true } },
    createdBy: adminUser.id,
    updatedBy: annotatorUser.id
  });
  const jobTask_taskFetch2 = await createJobTask({
    projectId: task1.projectId,
    resourceId: task1.id,
    task: JobTask.TASK.TASK_FETCH,
    type: JobTask.TYPE.ADHOC,
    status: JobTask.STATUS.ONGOING,
    config: { data: { refresh: true } },
    createdBy: adminUser.id,
    updatedBy: annotatorUser.id,
    startedAt: "2019-01-01T00:00:00.000Z"
  });
  const jobTask_taskFetch3 = await createJobTask({
    projectId: task1.projectId,
    resourceId: task1.id,
    task: JobTask.TASK.TASK_FETCH,
    type: JobTask.TYPE.ADHOC,
    status: JobTask.STATUS.OK,
    config: { data: { refresh: true }, result: { added: 100 } },
    createdBy: adminUser.id,
    updatedBy: annotatorUser.id,
    startedAt: "2019-01-02T00:00:00.000Z",
    finishedAt: "2019-01-02T00:01:00.000Z"
  });
  const jobTask_taskFetch4 = await createJobTask({
    projectId: task2.projectId,
    resourceId: task2.id,
    task: JobTask.TASK.TASK_FETCH,
    type: JobTask.TYPE.ADHOC,
    status: JobTask.STATUS.OK,
    config: { data: { refresh: true }, result: { added: 10 } },
    createdBy: adminUser.id,
    updatedBy: annotatorUser.id,
    startedAt: "2019-01-03T00:00:00.000Z",
    finishedAt: "2019-01-03T00:01:00.000Z"
  });
  const jobTask_taskExport1 = await createJobTask({
    projectId: task1.projectId,
    resourceId: task1.id,
    task: JobTask.TASK.TASK_EXPORT,
    type: JobTask.TYPE.SCHEDULED,
    status: JobTask.STATUS.NOT_STARTED,
    config: { data: { target: 2, includeOngoing: false } },
    createdBy: adminUser.id,
    updatedBy: annotatorUser.id
  });
  const jobTask_taskExport2 = await createJobTask({
    projectId: task1.projectId,
    resourceId: task1.id,
    task: JobTask.TASK.TASK_EXPORT,
    type: JobTask.TYPE.ADHOC,
    status: JobTask.STATUS.ONGOING,
    config: { data: { target: 2, includeOngoing: false } },
    createdBy: adminUser.id,
    updatedBy: annotatorUser.id,
    startedAt: "2019-01-01T00:00:00.000Z"
  });
  const jobTask_taskExport3 = await createJobTask({
    projectId: task1.projectId,
    resourceId: task1.id,
    task: JobTask.TASK.TASK_EXPORT,
    type: JobTask.TYPE.ADHOC,
    status: JobTask.STATUS.OK,
    config: {
      data: { target: 1, includeOngoing: true },
      result: { count: 100, file: "path/to/export/file.tar.gz" }
    },
    createdBy: adminUser.id,
    updatedBy: annotatorUser.id,
    startedAt: "2019-01-02T00:00:00.000Z",
    finishedAt: "2019-01-02T00:01:00.000Z"
  });
  const jobTask_taskExport4 = await createJobTask({
    projectId: task2.projectId,
    resourceId: task2.id,
    task: JobTask.TASK.TASK_EXPORT,
    type: JobTask.TYPE.ADHOC,
    status: JobTask.STATUS.OK,
    config: {
      data: { target: 2, includeOngoing: false },
      result: { count: 100, file: "path/to/export/file.tar.gz" }
    },
    createdBy: adminUser.id,
    updatedBy: annotatorUser.id,
    startedAt: "2019-01-03T00:00:00.000Z",
    finishedAt: "2019-01-03T00:01:00.000Z"
  });
  const jobTask_taskExport5 = await createJobTask({
    projectId: task2.projectId,
    resourceId: task2.id,
    task: JobTask.TASK.TASK_EXPORT,
    type: JobTask.TYPE.ADHOC,
    status: JobTask.STATUS.ERROR,
    config: {
      data: { target: 2, includeOngoing: false },
      result: { error: "foobar" }
    },
    createdBy: adminUser.id,
    updatedBy: annotatorUser.id,
    startedAt: "2019-01-03T00:00:00.000Z",
    finishedAt: "2019-01-03T00:01:00.000Z"
  });
  return {
    users: {
      normalUser,
      annotatorUser,
      adminUser,
      superadminUser,
      appadminUser,
      differentAdminUser
    },
    projects: { project1, project2, project3, project4, project5 },
    mediaSources: { mediaSource1, mediaSource2, mediaSource3 },
    taskTemplates: { template1, template2, template3, template4 },
    tasks: { task1, task2, task3, task4 },
    taskAssignments: { taskAssignment1, taskAssignment2 },
    mediaItems: {
      mediaItem1,
      mediaItem2,
      mediaItem3,
      mediaItem4,
      mediaItem5,
      mediaItem6
    },
    taskItems: {
      taskItem1,
      taskItem2,
      taskItem3,
      taskItem4,
      taskItem5,
      taskItem6
    },
    jobTasks: {
      jobTask_taskFetch1,
      jobTask_taskFetch2,
      jobTask_taskFetch3,
      jobTask_taskFetch4,
      jobTask_taskExport1,
      jobTask_taskExport2,
      jobTask_taskExport3,
      jobTask_taskExport4,
      jobTask_taskExport5
    }
  };
};

module.exports = {
  db: {
    resetTestDb,
    createUser,
    createProject,
    createTaskTemplate,
    createTask,
    createMediaSource,
    generateTestData: async () => {
      try {
        const data = await generateTestData();
        return data;
      } catch (error) {
        console.error(error);
      }
    }
  }
};
