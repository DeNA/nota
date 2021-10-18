jest.mock("../lib/datasource");
jest.mock("archiver");

const { db } = require("../lib/testUtils");
const taskExport = require("./taskExport");
const { Task } = require("../models");
const ds = require("../lib/datasource");
const archiver = require("archiver");

let data;
let archiverEventHandlers = {};
const archiverAppend = jest.fn();
const archiverFinalize = jest.fn();
const archiverOn = jest.fn((event, callback) => {
  archiverEventHandlers[event] = callback;
});
const delay = async function(ms) {
  return new Promise(resolve => {
    setTimeout(() => resolve(true), ms);
  });
};

beforeAll(async () => {
  data = await db.resetTestDb();
  // @ts-ignore
  ds()._resetFilesForTest();
  archiver.mockImplementation(() => ({
    append: archiverAppend,
    finalize: archiverFinalize,
    on: archiverOn
  }));
});

afterAll(() => {
  // @ts-ignore
  ds()._resetFilesForTest();
  archiver.mockReset();
});

afterEach(() => {
  archiverAppend.mockClear();
  archiverFinalize.mockClear();
  archiverOn.mockClear();
  archiverEventHandlers = {};
});

describe("taskExport", () => {
  test("export correctly all", async () => {
    const resultPromise = taskExport({
      resourceId: 1,
      config: {
        data: {
          target: Task.EXPORT_TARGET.ALL,
          includeOngoing: true,
          name: "test_export_all"
        }
      },
      createdBy: 1,
      id: 5000
    });

    while (!archiverEventHandlers.end) {
      await delay(10);
    }

    archiverEventHandlers.end();

    const result = await resultPromise;

    expect(result).toEqual({
      count: 2,
      file: "/path/to/test/export.tar.gz"
    });

    expect(archiverAppend.mock.calls.length).toBe(2);
    expect(JSON.parse(archiverAppend.mock.calls[0][0])).toEqual({
      image: {
        path: "aaa",
        name: "media_item_1.jpg",
        notaUrl: "http://example.com/annotation/1/1/1/1"
      },
      done: true,
      annotations: []
    });
    expect(archiverAppend.mock.calls[0][1]).toEqual({
      name: "media_item_1.jpg.json"
    });
    expect(JSON.parse(archiverAppend.mock.calls[1][0])).toEqual({
      image: {
        path: "aaa/bbb",
        name: "media_item_2.jpg",
        notaUrl: "http://example.com/annotation/1/1/1/2"
      },
      done: true,
      annotations: []
    });
    expect(archiverAppend.mock.calls[1][1]).toEqual({
      name: "media_item_2.jpg.json"
    });
  });

  test("export correctly updated", async () => {
    const resultPromise = taskExport({
      resourceId: 1,
      projectId: 1,
      config: {
        data: {
          target: Task.EXPORT_TARGET.NEW_AND_UPDATED,
          includeOngoing: true,
          name: "test_export_new_updated"
        }
      },
      createdBy: 1,
      createdAt: new Date(),
      id: 5000
    });

    while (!archiverEventHandlers.end) {
      await delay(10);
    }

    archiverEventHandlers.end();

    const result = await resultPromise;

    expect(result).toEqual({
      count: 1,
      file: "/path/to/test/export.tar.gz"
    });

    expect(archiverAppend.mock.calls.length).toBe(1);
    expect(JSON.parse(archiverAppend.mock.calls[0][0])).toEqual({
      image: {
        path: "aaa/bbb",
        name: "media_item_2.jpg",
        notaUrl: "http://example.com/annotation/1/1/1/2"
      },
      done: true,
      annotations: []
    });
    expect(archiverAppend.mock.calls[0][1]).toEqual({
      name: "media_item_2.jpg.json"
    });
  });

  test("returns 0 when 0 items to export", async () => {
    const result = await taskExport({
      resourceId: 3,
      config: {
        data: {
          target: Task.EXPORT_TARGET.ALL,
          includeOngoing: true,
          name: "test_export_1"
        }
      },
      createdBy: 1
    });

    expect(result).toEqual({ count: 0, file: null });
  });
});
