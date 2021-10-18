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
  Annotation,
  JobTask,
  sequelize
} = require("../models");
const authUtils = require("./authUtils");
const { spawn } = require("child-process-promise");
const fs = require("fs");
const config = require("../config");
const DB_FILE = config.db.storage;
const DB_CLEAN_FILE = DB_FILE + ".tmp";
const DB_DATA_JSON = DB_FILE + ".tmp.json";

const setupDb = async () => {
  const options = { stdio: "inherit" };
  const sequelize = "node_modules/.bin/sequelize";
  try {
    // fs.unlinkSync("./" + config.db.storage);
    await spawn(sequelize, ["db:migrate:undo:all"]);
    await spawn(sequelize, ["db:migrate"]);
    const data = await generateTestData();
    fs.writeFileSync(DB_DATA_JSON, JSON.stringify(data));
    fs.copyFileSync(DB_FILE, DB_CLEAN_FILE);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const resetTestDb = async () => {
  fs.copyFileSync(DB_CLEAN_FILE, DB_FILE);
  const data = require(DB_DATA_JSON);
  return data;
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
  name = `mediaSource${Math.random()}`,
  description = "media source description",
  projectId = 1,
  datasource = "file",
  status = MediaSource.STATUS.READY,
  isFetchScheduled = false,
  fetchSchedule = null,
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
    isFetchScheduled,
    fetchSchedule,
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
    conditions: { filter_string: ["foo"], filter_integer: [0, 10] }
  },
  status = 100,
  isFetchScheduled = false,
  fetchSchedule = null,
  isExportScheduled = false,
  exportSchedule = null,
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
    isFetchScheduled,
    fetchSchedule,
    isExportScheduled,
    exportSchedule,
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
  updatedBy = 1,
  createdAt = null,
  updatedAt = null
}) => {
  const taskItem = await TaskItem.create({
    name,
    mediaItemId,
    taskId,
    taskAssignmentId,
    status,
    createdBy,
    updatedBy,
    createdAt,
    updatedAt
  });

  // https://github.com/sequelize/sequelize/issues/3759
  if (updatedAt) {
    await sequelize.query(
      `
      UPDATE task_items SET updated_at='${updatedAt}' WHERE id=${taskItem.id}
    `,
      { type: sequelize.QueryTypes.UPDATE }
    );
  }

  return taskItem.get({ plain: true });
};

const createAnnotation = async ({
  taskItemId = 1,
  boundaries = null,
  labels = null,
  labelsName = "test",
  status = 0,
  createdBy = 1,
  updatedBy = 1
}) => {
  const annotation = await Annotation.create({
    taskItemId,
    boundaries,
    labels,
    labelsName,
    status,
    createdBy,
    updatedBy
  });

  return annotation.get({ plain: true });
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
  updatedBy = 1,
  createdAt = null,
  updatedAt = null
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
    updatedBy,
    createdAt,
    updatedAt
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
    config: {},
    isFetchScheduled: true,
    fetchSchedule: {
      lastExecution: 1,
      config: { cron: "* */3 * * *", userId: 1 }
    }
  });
  const mediaSource3 = await createMediaSource({
    name: "media_source 3",
    description: "media_source 3 description",
    projectId: project2.id,
    datasource: "file",
    status: MediaSource.STATUS.READY,
    config: {},
    isFetchScheduled: true,
    fetchSchedule: {
      lastExecution: Date.now() + 1000 * 60 * 60,
      config: { cron: "* */3 * * *", userId: 1 }
    }
  });
  const mediaSource4 = await createMediaSource({
    name: "media_source 4",
    description: "media_source 4 no fetch schedule",
    projectId: project2.id,
    datasource: "file",
    status: MediaSource.STATUS.READY,
    config: {},
    isFetchScheduled: true,
    fetchSchedule: null
  });
  const mediaSource5 = await createMediaSource({
    name: "media_source 5",
    description: "media_source 5 missing config fetch schedule",
    projectId: project2.id,
    datasource: "file",
    status: MediaSource.STATUS.READY,
    config: {},
    isFetchScheduled: true,
    fetchSchedule: { lastExecution: 1, config: {} }
  });

  // task_templates
  const template1 = await createTaskTemplate({
    name: "template_1",
    projectId: project1.id,
    template: {
      parser: "json",
      foo: "bar",
      annotations: [
        {
          name: "media_test",
          label: "MediaLabelsTest",
          type: "MEDIA_LABELS",
          options: {
            autoCreate: true,
            undeletable: true
          },
          labels: [
            {
              name: "frame",
              label: "Frame",
              type: "TEXT_INPUT",
              options: {
                required: true,
                regExp: "^[0-9]*$",
                description: "Insert the frame number"
              }
            }
          ]
        }
      ]
    }
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
    updatedBy: adminUser.id,
    isFetchScheduled: true,
    isExportScheduled: true,
    fetchSchedule: {
      lastExecution: 1,
      config: { cron: "* */3 * * *", userId: 1 }
    },
    exportSchedule: {
      lastExecution: 1,
      config: { cron: "* */3 * * *", userId: 1 }
    }
  });
  const task3 = await createTask({
    name: "task_3_done",
    projectId: project1.id,
    taskTemplateId: template1.id,
    mediaSourceId: mediaSource1.id,
    mediaSourceConfig: { options: { path: "files1" } },
    status: 500,
    createdBy: adminUser.id,
    updatedBy: adminUser.id,
    isFetchScheduled: true,
    isExportScheduled: true,
    fetchSchedule: {
      lastExecution: 1,
      config: { cron: "* */3 * * *", userId: 1 }
    },
    exportSchedule: {
      lastExecution: 1,
      config: { cron: "* */3 * * *", userId: 1 }
    }
  });
  const task4 = await createTask({
    name: "task_4_hidden",
    projectId: project1.id,
    taskTemplateId: template1.id,
    mediaSourceId: mediaSource1.id,
    mediaSourceConfig: { options: { path: "files1" } },
    status: 50,
    createdBy: adminUser.id,
    updatedBy: adminUser.id,
    isFetchScheduled: true,
    isExportScheduled: true,
    fetchSchedule: {
      lastExecution: 1,
      config: { cron: "* */3 * * *", userId: 1 }
    },
    exportSchedule: {
      lastExecution: 1,
      config: { cron: "* */3 * * *", userId: 1 }
    }
  });
  const task5 = await createTask({
    name: "task_5_no_fetch_schedule_config",
    projectId: project1.id,
    taskTemplateId: template1.id,
    mediaSourceId: mediaSource1.id,
    mediaSourceConfig: { options: { path: "files1" } },
    status: 100,
    createdBy: adminUser.id,
    updatedBy: adminUser.id,
    isFetchScheduled: true,
    isExportScheduled: true,
    fetchSchedule: null,
    exportSchedule: null
  });
  const task6 = await createTask({
    name: "task_6_no_missing_schedule_config",
    projectId: project1.id,
    taskTemplateId: template1.id,
    mediaSourceId: mediaSource1.id,
    mediaSourceConfig: { options: { path: "files1" } },
    status: 100,
    createdBy: adminUser.id,
    updatedBy: adminUser.id,
    isFetchScheduled: true,
    isExportScheduled: true,
    fetchSchedule: {},
    exportSchedule: { lastExecution: 1, config: {} }
  });
  const task7 = await createTask({
    name: "task_5_no_missing_schedule_config",
    projectId: project1.id,
    taskTemplateId: template1.id,
    mediaSourceId: mediaSource1.id,
    mediaSourceConfig: { options: { path: "files1" } },
    status: 100,
    createdBy: adminUser.id,
    updatedBy: adminUser.id,
    isFetchScheduled: true,
    isExportScheduled: true,
    fetchSchedule: {
      lastExecution: Date.now() + 1000 * 60 * 60,
      config: { cron: "* */3 * * *", userId: 1 }
    },
    exportSchedule: {
      lastExecution: Date.now() + 1000 * 60 * 60,
      config: { cron: "* */3 * * *", userId: 1 }
    }
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
    updatedBy: annotatorUser.id,
    createdAt: "2019-01-01 00:00:00",
    updatedAt: "2019-01-02 00:00:00"
  });
  const taskItem2 = await createTaskItem({
    mediaItemId: mediaItem2.id,
    taskId: task1.id,
    taskAssignmentId: taskAssignment1.id,
    status: TaskItem.STATUS.DONE,
    createdBy: adminUser.id,
    updatedBy: annotatorUser.id,
    createdAt: "2019-01-01 00:00:00",
    updatedAt: "2019-01-10 00:00:00"
  });
  const taskItem3 = await createTaskItem({
    mediaItemId: mediaItem3.id,
    taskId: task1.id,
    taskAssignmentId: taskAssignment2.id,
    status: TaskItem.STATUS.NOT_DONE,
    createdBy: adminUser.id,
    updatedBy: annotatorUser.id,
    createdAt: "2019-01-01 00:00:00",
    updatedAt: "2019-01-02 00:00:00"
  });
  const taskItem4 = await createTaskItem({
    mediaItemId: mediaItem4.id,
    taskId: task1.id,
    taskAssignmentId: taskAssignment2.id,
    status: TaskItem.STATUS.NOT_DONE,
    createdBy: adminUser.id,
    updatedBy: annotatorUser.id,
    createdAt: "2019-01-01 00:00:00",
    updatedAt: "2019-01-10 00:00:00"
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
    updatedBy: annotatorUser.id,
    createdAt: "2019-01-05T00:00:00.000Z"
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
    startedAt: "2019-01-01T00:00:00.000Z",
    createdAt: "2019-01-05T00:00:00.000Z"
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
    finishedAt: "2019-01-02T00:01:00.000Z",
    createdAt: "2019-01-05T00:00:00.000Z"
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
    finishedAt: "2019-01-03T00:01:00.000Z",
    createdAt: "2019-01-05T00:00:00.000Z"
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
    finishedAt: "2019-01-03T00:01:00.000Z",
    createdAt: "2019-01-05T00:00:00.000Z"
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
    mediaSources: {
      mediaSource1,
      mediaSource2,
      mediaSource3,
      mediaSource4,
      mediaSource5
    },
    taskTemplates: { template1, template2, template3, template4 },
    tasks: { task1, task2, task3, task4, task5, task6, task7 },
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
    setupDb,
    resetTestDb,
    createUser,
    createProject,
    createTaskTemplate,
    createTask,
    createTaskItem,
    createTaskAssignment,
    createAnnotation,
    createMediaSource
  }
};
