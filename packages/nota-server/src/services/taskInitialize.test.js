const { db } = require("../lib/testUtils");
const taskInitialize = require("./taskInitialize");
const { Task, MediaSource, MediaItem, Annotation } = require("../models");
const fsmock = require("mock-fs");
const { Readable } = require("stream");
const AWS = require("aws-sdk-mock");

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

const files = {
  "/a/b/c/1.jpg": "binary",
  "/a/b/c/1.jpg.meta.json": `{"filter_string":"bar","filter_integer":1111,"filter_date":"2020-01-01","foo":"bar","nested":{"deep":{"filter_string":"nested_bar"}}}`,
  "/a/b/c/2.jpg": "binary",
  "/a/b/1.mp4": "binary",
  "/a/b/2.mp4": "binary",
  "/a/b/3.jpg": "binary",
  "/a/b/4.jpg": "binary",
  "/a/1.jpg": "binary",
  "/a/1.jpg.json": `{"annotations":[{"type":"typeA","labels":{"foo":"bar"},"boundaries":{"type":"RECTANGLE","top":10,"bottom":10,"left":10,"right":10}},{"type":"media_test","labels":{"fizz":"buzz"}}]}`,
  "/a/1.jpg.meta.json": `{"filter_string": "foo", "filter_integer": "not_an_integer","filter_date":"not_a_date","fizz":"buzz","nested":{}}`
};

const checkTaskItemsQuery = {
  include: [
    {
      attributes: ["id", "boundaries", "labels", "labelsName", "status"],
      model: Annotation
    },
    {
      attributes: ["id", "name", "path"],
      model: MediaItem
    }
  ],
  order: [["id", "ASC"], [Annotation, "id", "ASC"]]
};

describe("taskInitialize", () => {
  describe("file datasource", () => {
    let mediaSource;
    let task;
    let taskId;
    beforeAll(async () => {
      data = await db.resetTestDb();
    });

    afterAll(() => {
      fsmock.restore();
    });
    beforeAll(async () => {
      fsmock({ ...files }, { createCwd: false, createTmp: false });
      mediaSource = await db.createMediaSource({
        name: "media_source test",
        projectId: data.projects.project1.id,
        config: {
          extensions: ["jpg"],
          path: "",
          exportPath: "",
          filters: [
            { name: "filter_string", label: "String", type: 1 },
            { name: "filter_integer", label: "Integer", type: 2 },
            { name: "filter_date", label: "Date", type: 3 }
          ]
        }
      });
      mediaSource = await MediaSource.findByPk(mediaSource.id);
      await mediaSource.fetchMediaItems();
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

      const taskItemsAfter = await task.getTaskItems(checkTaskItemsQuery);

      expect(taskItemsAfter.length).toBe(5);
      expect(taskItemsAfter[0].annotations).toMatchObject([
        { labels: { fizz: "buzz" }, labelsName: "media_test" },
        { labelsName: "typeA" }
      ]);
      expect(taskItemsAfter[0].mediaItem).toMatchObject({
        name: "1.jpg",
        path: "a"
      });

      expect(taskItemsAfter[1].annotations).toMatchObject([
        { labels: {}, labelsName: "media_test" }
      ]);
      expect(taskItemsAfter[1].mediaItem).toMatchObject({
        name: "1.jpg",
        path: "a/b/c"
      });

      expect(taskItemsAfter[2].annotations).toMatchObject([
        { labels: {}, labelsName: "media_test" }
      ]);
      expect(taskItemsAfter[2].mediaItem).toMatchObject({
        name: "2.jpg",
        path: "a/b/c"
      });

      expect(taskItemsAfter[3].annotations).toMatchObject([
        { labels: {}, labelsName: "media_test" }
      ]);
      expect(taskItemsAfter[3].mediaItem).toMatchObject({
        name: "3.jpg",
        path: "a/b"
      });

      expect(taskItemsAfter[4].annotations).toMatchObject([
        { labels: {}, labelsName: "media_test" }
      ]);
      expect(taskItemsAfter[4].mediaItem).toMatchObject({
        name: "4.jpg",
        path: "a/b"
      });
    });

    test("run correctly refresh", async () => {
      // Add extra media items
      fsmock(
        {
          ...files,
          "/2.jpg": "binary",
          "/2.jpg.json": `{"annotations":[{"type":"typeB","labels":{"foo":"bar"},"boundaries":{"type":"RECTANGLE","top":20,"bottom":20,"left":20,"right":20}}]}`,
          "/1.mp4": "binary"
        },
        { createCwd: false, createTmp: false }
      );
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

      const taskItemsAfter = await task.getTaskItems(checkTaskItemsQuery);

      expect(taskItemsAfter.length).toBe(6);
      expect(taskItemsAfter[5].annotations).toMatchObject([
        { labels: {}, labelsName: "media_test" },
        { labelsName: "typeB" }
      ]);
      expect(taskItemsAfter[5].mediaItem).toMatchObject({
        name: "2.jpg",
        path: ""
      });
    });

    describe("taskInitialize nested", () => {
      let mediaSource;
      let task;
      let taskId;
      const files = {
        "/a/b/c/1.jpg": "binary",
        "/a/b/c/1.jpg.json": `{"annotations":[{"type":"typeA","labels":{"foo":"bar"},"boundaries":{"type":"RECTANGLE","top":10,"bottom":10,"left":10,"right":10}}]}`,
        "/a/b/c/1.jpg.meta.json": `{"filter_string":"bar","filter_integer":1111,"filter_date":"2020-01-01","foo":"bar","nested":{"deep":{"filter_string":"nested_bar"}}}`,
        "/a/b/c/2.jpg": "binary",
        "/a/b/1.mp4": "binary",
        "/a/b/2.mp4": "binary",
        "/a/b/3.jpg": "binary",
        "/a/b/3.jpg.json": `{"annotations":[{"type":"typeB","labels":{"foo":"bar"},"boundaries":{"type":"RECTANGLE","top":10,"bottom":10,"left":10,"right":10}}]}`,
        "/a/b/4.jpg": "binary",
        "/a/1.jpg": "binary",
        "/a/1.jpg.json": `{"annotations":[{"type":"typeC","labels":{"foo":"bar"},"boundaries":{"type":"RECTANGLE","top":10,"bottom":10,"left":10,"right":10}}]}`,
        "/a/1.jpg.meta.json": `{"filter_string": "foo", "filter_integer": "not_an_integer","filter_date":"not_a_date","fizz":"buzz","nested":{}}`
      };
      beforeAll(async () => {
        fsmock({ ...files }, { createCwd: false, createTmp: false });
        mediaSource = await db.createMediaSource({
          name: "media_source nested test",
          projectId: data.projects.project1.id,
          config: {
            extensions: ["jpg"],
            path: "/a",
            exportPath: "/a/out",
            filters: []
          }
        });
        mediaSource = await MediaSource.findByPk(mediaSource.id);
        await mediaSource.fetchMediaItems();
        task = await createTask({
          name: "test_nested",
          mediaSourceId: mediaSource.id,
          mediaSourceConfig: {
            conditions: {},
            options: {
              path: "b"
            }
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
        expect(result).toEqual({ added: 4 });

        const taskItemsAfter = await task.getTaskItems(checkTaskItemsQuery);
        expect(taskItemsAfter.length).toBe(4);

        expect(taskItemsAfter[0].annotations).toMatchObject([
          { labels: {}, labelsName: "media_test" },
          { labelsName: "typeA" }
        ]);
        expect(taskItemsAfter[0].mediaItem).toMatchObject({
          name: "1.jpg",
          path: "b/c"
        });

        expect(taskItemsAfter[1].annotations).toMatchObject([
          { labels: {}, labelsName: "media_test" }
        ]);
        expect(taskItemsAfter[1].mediaItem).toMatchObject({
          name: "2.jpg",
          path: "b/c"
        });

        expect(taskItemsAfter[2].annotations).toMatchObject([
          { labels: {}, labelsName: "media_test" },
          { labelsName: "typeB" }
        ]);
        expect(taskItemsAfter[2].mediaItem).toMatchObject({
          name: "3.jpg",
          path: "b"
        });

        expect(taskItemsAfter[3].annotations).toMatchObject([
          { labels: {}, labelsName: "media_test" }
        ]);
        expect(taskItemsAfter[3].mediaItem).toMatchObject({
          name: "4.jpg",
          path: "b"
        });
      });
    });
  });

  describe("s3 datasource", () => {
    let filesS3 = { ...files };
    let mediaSource;
    let task;
    let taskId;
    beforeAll(async () => {
      data = await db.resetTestDb();
      AWS.mock(
        "S3",
        "listObjectsV2",
        ({ Prefix, ContinuationToken }, callback) => {
          const keys = Object.keys(filesS3).sort();
          const filtered = Prefix
            ? keys.filter(key => key.startsWith(`/${Prefix}`))
            : keys;
          const start = ContinuationToken ? parseInt(ContinuationToken) : 0;
          const end = start + 3;
          const next = end <= filtered.length ? end : undefined;
          const contents = filtered.slice(start, end).map(key => ({
            Key: key
          }));

          callback(null, {
            Contents: contents,
            NextContinuationToken: next?.toString()
          });
        }
      );
      AWS.mock("S3", "getObject", ({ Key }) => {
        return Readable.from(filesS3[`/${Key}`]);
      });
      mediaSource = await db.createMediaSource({
        projectId: data.projects.project1.id,
        datasource: "s3",
        config: {
          extensions: ["jpg"],
          path: "",
          bucket: "dummy-bucket",
          exportPath: "",
          filters: [
            { name: "filter_string", label: "String", type: 1 },
            { name: "filter_integer", label: "Integer", type: 2 },
            { name: "filter_date", label: "Date", type: 3 }
          ]
        }
      });
      mediaSource = await MediaSource.findByPk(mediaSource.id);
      await mediaSource.fetchMediaItems();
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

    afterAll(() => {
      AWS.restore();
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

      const taskItemsAfter = await task.getTaskItems(checkTaskItemsQuery);

      expect(taskItemsAfter.length).toBe(5);
      expect(taskItemsAfter[0].annotations).toMatchObject([
        { labels: { fizz: "buzz" }, labelsName: "media_test" },
        { labelsName: "typeA" }
      ]);
      expect(taskItemsAfter[0].mediaItem).toMatchObject({
        name: "1.jpg",
        path: "a"
      });

      expect(taskItemsAfter[1].annotations).toMatchObject([
        { labels: {}, labelsName: "media_test" }
      ]);
      expect(taskItemsAfter[1].mediaItem).toMatchObject({
        name: "1.jpg",
        path: "a/b/c"
      });

      expect(taskItemsAfter[2].annotations).toMatchObject([
        { labels: {}, labelsName: "media_test" }
      ]);
      expect(taskItemsAfter[2].mediaItem).toMatchObject({
        name: "2.jpg",
        path: "a/b/c"
      });

      expect(taskItemsAfter[3].annotations).toMatchObject([
        { labels: {}, labelsName: "media_test" }
      ]);
      expect(taskItemsAfter[3].mediaItem).toMatchObject({
        name: "3.jpg",
        path: "a/b"
      });

      expect(taskItemsAfter[4].annotations).toMatchObject([
        { labels: {}, labelsName: "media_test" }
      ]);
      expect(taskItemsAfter[4].mediaItem).toMatchObject({
        name: "4.jpg",
        path: "a/b"
      });
    });

    test("run correctly refresh", async () => {
      // Add extra media items
      filesS3["/2.jpg"] = "binary";
      filesS3[
        "/2.jpg.json"
      ] = `{"annotations":[{"type":"typeB","labels":{"foo":"bar"},"boundaries":{"type":"RECTANGLE","top":20,"bottom":20,"left":20,"right":20}}]}`;
      filesS3["/1.mp4"] = "binary";

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

      const taskItemsAfter = await task.getTaskItems(checkTaskItemsQuery);

      expect(taskItemsAfter.length).toBe(6);
      expect(taskItemsAfter[5].annotations).toMatchObject([
        { labels: {}, labelsName: "media_test" },
        { labelsName: "typeB" }
      ]);
      expect(taskItemsAfter[5].mediaItem).toMatchObject({
        name: "2.jpg",
        path: ""
      });
    });

    describe("taskInitialize nested", () => {
      let mediaSource;
      let task;
      let taskId;
      beforeAll(async () => {
        filesS3 = {
          "/a/b/c/1.jpg": "binary",
          "/a/b/c/1.jpg.json": `{"annotations":[{"type":"typeA","labels":{"foo":"bar"},"boundaries":{"type":"RECTANGLE","top":10,"bottom":10,"left":10,"right":10}}]}`,
          "/a/b/c/1.jpg.meta.json": `{"filter_string":"bar","filter_integer":1111,"filter_date":"2020-01-01","foo":"bar","nested":{"deep":{"filter_string":"nested_bar"}}}`,
          "/a/b/c/2.jpg": "binary",
          "/a/b/1.mp4": "binary",
          "/a/b/2.mp4": "binary",
          "/a/b/3.jpg": "binary",
          "/a/b/3.jpg.json": `{"annotations":[{"type":"typeB","labels":{"foo":"bar"},"boundaries":{"type":"RECTANGLE","top":10,"bottom":10,"left":10,"right":10}}]}`,
          "/a/b/4.jpg": "binary",
          "/a/1.jpg": "binary",
          "/a/1.jpg.json": `{"annotations":[{"type":"typeC","labels":{"foo":"bar"},"boundaries":{"type":"RECTANGLE","top":10,"bottom":10,"left":10,"right":10}}]}`,
          "/a/1.jpg.meta.json": `{"filter_string": "foo", "filter_integer": "not_an_integer","filter_date":"not_a_date","fizz":"buzz","nested":{}}`
        };
        mediaSource = await db.createMediaSource({
          projectId: data.projects.project1.id,
          datasource: "s3",
          config: {
            extensions: ["jpg"],
            bucket: "dummy-bucket",
            path: "a",
            exportPath: "/a/out",
            filters: []
          }
        });
        mediaSource = await MediaSource.findByPk(mediaSource.id);
        await mediaSource.fetchMediaItems();
        task = await createTask({
          name: "test_nested",
          mediaSourceId: mediaSource.id,
          mediaSourceConfig: {
            conditions: {},
            options: {
              path: "b"
            }
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
        expect(result).toEqual({ added: 4 });

        const taskItemsAfter = await task.getTaskItems(checkTaskItemsQuery);

        expect(taskItemsAfter.length).toBe(4);
        expect(taskItemsAfter[0].annotations).toMatchObject([
          { labelsName: "media_test" },
          { labelsName: "typeA" }
        ]);
        expect(taskItemsAfter[0].mediaItem).toMatchObject({
          name: "1.jpg",
          path: "b/c"
        });
        expect(taskItemsAfter[1].annotations).toMatchObject([
          { labelsName: "media_test" }
        ]);
        expect(taskItemsAfter[1].mediaItem).toMatchObject({
          name: "2.jpg",
          path: "b/c"
        });
        expect(taskItemsAfter[2].annotations).toMatchObject([
          { labelsName: "media_test" },
          { labelsName: "typeB" }
        ]);
        expect(taskItemsAfter[2].mediaItem).toMatchObject({
          name: "3.jpg",
          path: "b"
        });
        expect(taskItemsAfter[3].annotations).toMatchObject([
          { labelsName: "media_test" }
        ]);
        expect(taskItemsAfter[3].mediaItem).toMatchObject({
          name: "4.jpg",
          path: "b"
        });
      });
    });
  });
});
