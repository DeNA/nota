jest.mock("../lib/datasource");
const { db } = require("../lib/testUtils");
const taskInitialize = require("./taskInitialize");
const { Task, MediaSource, Annotation } = require("../models");
const ds = require("../lib/datasource");

let mediaSource;
let data;

const createTask = async function({
  name = "task_1",
  mediaSourceConfig = {
    options: {},
    conditions: {}
  },
  mediaSourceId = 1
}) {
  const newTask = await db.createTask({
    name,
    mediaSourceConfig,
    mediaSourceId
  });

  return await Task.findByPk(newTask.id);
};

beforeAll(async () => {
  data = await db.resetTestDb();
  // @ts-ignore
  ds()._resetFilesForTest();
  mediaSource = await db.createMediaSource({
    name: "media_source test",
    projectId: data.projects.project1.id,
    config: {
      extensions: ["jpg"],
      bucket: "dummy-bucket",
      path: "",
      exportPath: "output",
      filters: [
        { name: "filter_string", label: "String", type: 1 },
        { name: "filter_integer", label: "Integer", type: 2 },
        { name: "filter_date", label: "Date", type: 3 }
      ]
    }
  });
  mediaSource = await MediaSource.findByPk(mediaSource.id);
  await mediaSource.fetchMediaItems();
});

afterAll(() => {
  // @ts-ignore
  ds()._resetFilesForTest();
});

describe("taskInitialize", () => {
  let task;
  let taskId;
  beforeAll(async () => {
    task = await createTask({
      name: "test_a",
      mediaSourceId: mediaSource.id,
      mediaSourceConfig: {
        conditions: {},
        options: {}
      }
    });
    taskId = task.id;
  });
  test("run correctly first time", async () => {
    const taskItemsBefore = await task.getTaskItems();
    expect(taskItemsBefore).toEqual([]);

    const jobTask = {
      resourceId: taskId,
      config: {
        data: {
          refresh: false
        }
      },
      createdBy: 1
    };

    const result = await taskInitialize(jobTask);
    expect(result).toEqual({ added: 5 });

    const taskItemsAfter = await task.getTaskItems({
      include: [
        {
          attributes: ["id", "boundaries", "labels", "labelsName", "status"],
          model: Annotation
        }
      ]
    });
    expect(taskItemsAfter).toMatchObject([
      {
        completedAt: null,
        completedBy: null,
        createdBy: 1,
        id: 7,
        mediaItemId: 11,
        status: 0,
        taskAssignment: null,
        taskAssignmentId: null,
        taskId,
        annotations: [
          {
            id: 1,
            labels: {},
            labelsName: "media_test",
            status: 0
          },
          {
            boundaries: {
              bottom: 10,
              left: 10,
              right: 10,
              top: 10,
              type: "RECTANGLE"
            },
            id: 2,
            labels: {
              labels: {
                foo: "bar"
              }
            },
            labelsName: "typeA",
            status: 0
          }
        ]
      },
      {
        completedAt: null,
        completedBy: null,
        createdBy: 1,
        id: 8,
        mediaItemId: 7,
        status: 0,
        taskAssignment: null,
        taskAssignmentId: null,
        taskId,
        annotations: [
          {
            id: 3,
            labels: {},
            labelsName: "media_test",
            status: 0
          }
        ]
      },
      {
        completedAt: null,
        completedBy: null,
        createdBy: 1,
        id: 9,
        mediaItemId: 8,
        status: 0,
        taskAssignment: null,
        taskAssignmentId: null,
        taskId,
        annotations: [
          {
            id: 4,
            labels: {},
            labelsName: "media_test",
            status: 0
          }
        ]
      },
      {
        completedAt: null,
        completedBy: null,
        createdBy: 1,
        id: 10,
        mediaItemId: 9,
        status: 0,
        taskAssignment: null,
        taskAssignmentId: null,
        taskId,
        annotations: [
          {
            id: 5,
            labels: {},
            labelsName: "media_test",
            status: 0
          }
        ]
      },
      {
        completedAt: null,
        completedBy: null,
        createdBy: 1,
        id: 11,
        mediaItemId: 10,
        status: 0,
        taskAssignment: null,
        taskAssignmentId: null,
        taskId,
        annotations: [
          {
            id: 6,
            labels: {},
            labelsName: "media_test",
            status: 0
          }
        ]
      }
    ]);
  });

  test("run correctly refresh", async () => {
    // Add extra media items
    // @ts-ignore
    const files = { ...ds()._getFilesForTest() };
    files["a/2.jpg"] = {
      name: "2.jpg",
      metadata: { importPathId: 1, resource: "a", fileName: "2.jpg" },
      value: "binary"
    };
    files["a/2.jpg.json"] = {
      name: "2.jpg.json",
      metadata: { importPathId: 1, resource: "a", fileName: "2.jpg.json" },
      value: `{"annotations":[{"type":"typeA","labels":{"foo":"bar"},"boundaries":{"type":"RECTANGLE","top":20,"bottom":20,"left":20,"right":20}}]}`
    };
    files["a/1.mp4"] = {
      name: "1.mp4",
      metadata: { importPathId: 1, resource: "a", fileName: "1.mp4" },
      value: "binary"
    };
    // @ts-ignore
    ds()._setFilesForTest(files);
    await mediaSource.fetchMediaItems(true);

    const jobTask = {
      resourceId: taskId,
      config: {
        data: {
          refresh: true
        }
      },
      createdBy: 1
    };

    const result = await taskInitialize(jobTask);
    expect(result).toEqual({ added: 1 });

    const taskItemsAfter = await task.getTaskItems({
      include: [
        {
          attributes: ["id", "boundaries", "labels", "labelsName", "status"],
          model: Annotation
        }
      ]
    });
    expect(taskItemsAfter).toMatchObject([
      {
        id: 7,
        annotations: [
          {
            id: 1,
            labels: {},
            labelsName: "media_test",
            status: 0
          },
          {
            boundaries: {
              bottom: 10,
              left: 10,
              right: 10,
              top: 10,
              type: "RECTANGLE"
            },
            id: 2,
            labels: {
              labels: {
                foo: "bar"
              }
            },
            labelsName: "typeA",
            status: 0
          }
        ]
      },
      {
        id: 8,
        annotations: [
          {
            id: 3,
            labels: {},
            labelsName: "media_test",
            status: 0
          }
        ]
      },
      {
        id: 9,
        annotations: [
          {
            id: 4,
            labels: {},
            labelsName: "media_test",
            status: 0
          }
        ]
      },
      {
        id: 10,
        annotations: [
          {
            id: 5,
            labels: {},
            labelsName: "media_test",
            status: 0
          }
        ]
      },
      {
        id: 11,
        annotations: [
          {
            id: 6,
            labels: {},
            labelsName: "media_test",
            status: 0
          }
        ]
      },
      {
        annotations: [
          {
            boundaries: undefined,
            id: 7,
            labels: {},
            labelsName: "media_test",
            status: 0
          },
          {
            boundaries: {
              bottom: 20,
              left: 20,
              right: 20,
              top: 20,
              type: "RECTANGLE"
            },
            id: 8,
            labels: {
              labels: {
                foo: "bar"
              }
            },
            labelsName: "typeA",
            status: 0
          }
        ],
        completedAt: null,
        completedBy: null,
        id: 12,
        mediaItemId: 12,
        status: 0,
        taskAssignment: null,
        taskAssignmentId: null,
        taskId: 5
      }
    ]);
  });
});
