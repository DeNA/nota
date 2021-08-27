jest.mock("./notaService");
jest.mock("./notaScheduler");

const { db } = require("../lib/testUtils");
const jobScheduler = require("./jobScheduler");
const mediaSourceFetchService = require("./mediaSourceFetchService");
const taskInitializeService = require("./taskInitializeService");
const taskExportService = require("./taskExportService");

let data;

beforeAll(async () => {
  data = await db.resetTestDb();
});

describe("jobScheduler", () => {
  test("should run correctly", async () => {
    await jobScheduler();
    expect(mediaSourceFetchService.add.mock.calls).toEqual([
      [
        {
          data: { refresh: true },
          projectId: 1,
          resourceId: 2,
          type: 2,
          userId: 1
        }
      ]
    ]);
    expect(taskInitializeService.add.mock.calls).toEqual([
      [
        {
          data: { refresh: true },
          projectId: 1,
          resourceId: 2,
          type: 2,
          userId: 1
        }
      ],
      [
        {
          data: { refresh: true },
          projectId: 1,
          resourceId: 4,
          type: 2,
          userId: 1
        }
      ]
    ]);
    expect(taskExportService.add.mock.calls).toEqual([
      [
        {
          data: { target: 2 },
          projectId: 1,
          resourceId: 2,
          type: 2,
          userId: 1
        }
      ],
      [
        {
          data: { target: 2 },
          projectId: 1,
          resourceId: 4,
          type: 2,
          userId: 1
        }
      ]
    ]);
  });
});
