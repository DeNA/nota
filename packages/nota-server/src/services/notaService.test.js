jest.mock("../lib/redisClient");
jest.mock("../lib/lock");
jest.mock("./notaScheduler");
jest.mock("bullmq");

const { JobTask } = require("../models");
const notaService = require("./notaService");
const redlock = require("../lib/lock");
const notaScheduler = require("./notaScheduler");

describe("notaService", () => {
  let processor;
  let jobTaskSpy;
  let service;
  let job;

  beforeAll(async () => {
    processor = jest.fn(async () => {
      return { hoge: "hoge" };
    });
    jobTaskSpy = jest.spyOn(JobTask.prototype, "update");
    service = notaService("test_service_name", 100, processor);
    service._queue.add.mockImplementation((name, { jobTaskId }) => ({
      id: 1000,
      jobTaskId
    }));
    job = await service.add({
      projectId: 1,
      resourceId: 1,
      data: { foo: "bar" },
      userId: 1,
      type: JobTask.TYPE.ADHOC
    });
  });

  afterAll(async () => {
    service._queue.add.mockReset();
    jobTaskSpy.mockRestore();
  });

  afterEach(() => {
    jest.useRealTimers();
    redlock.lock.mockReset();
    jobTaskSpy.mockReset();
  });

  test("service name should be set", async () => {
    expect(service.name).toBe("test_service_name");
  });

  test("should add job task correctly", async () => {
    const jobTask = await JobTask.findByPk(job.jobTaskId);
    expect(jobTask).toMatchObject({
      config: {
        data: {
          foo: "bar"
        }
      },
      createdBy: 1,
      finishedAt: null,
      id: 10,
      projectId: 1,
      resourceId: 1,
      startedAt: null,
      status: 0,
      task: 100,
      type: 1
    });
  });

  test("should execute job correctly and update jobTask", async () => {
    // Execute job
    await service._processor({
      id: job.id,
      data: { jobTaskId: job.jobTaskId }
    });

    expect(jobTaskSpy.mock.calls.length).toBe(2);
    expect(jobTaskSpy.mock.calls[0][0].status).toBe(JobTask.STATUS.ONGOING);
    expect(jobTaskSpy.mock.calls[0][0].startedAt).toBeDefined();
    expect(jobTaskSpy.mock.calls[1][0].config).toEqual({
      data: {
        foo: "bar"
      },
      result: {
        hoge: "hoge"
      }
    });
    expect(jobTaskSpy.mock.calls[1][0].result).toEqual({
      result: { hoge: "hoge" }
    });
    expect(jobTaskSpy.mock.calls[1][0].finishedAt).toBeDefined();
    expect(jobTaskSpy.mock.calls[1][0].status).toBe(JobTask.STATUS.OK);
  });

  test("should execute job and update jobTask with errors", async () => {
    // Execute job
    processor.mockImplementationOnce(() => {
      throw new Error("hogehoge");
    });
    const unlock = jest.fn();
    const extend = jest.fn();
    redlock.lock.mockReturnValue(Promise.resolve({ unlock, extend }));
    await service._processor({
      id: job.id,
      data: { jobTaskId: job.jobTaskId }
    });

    expect(jobTaskSpy.mock.calls.length).toBe(2);
    expect(jobTaskSpy.mock.calls[0][0].status).toBe(JobTask.STATUS.ONGOING);
    expect(jobTaskSpy.mock.calls[0][0].startedAt).toBeDefined();
    expect(jobTaskSpy.mock.calls[1][0].config).toEqual({
      data: {
        foo: "bar"
      },
      error: "hogehoge"
    });
    expect(jobTaskSpy.mock.calls[1][0].result).toBeUndefined();
    expect(jobTaskSpy.mock.calls[1][0].finishedAt).toBeDefined();
    expect(jobTaskSpy.mock.calls[1][0].status).toBe(JobTask.STATUS.ERROR);

    // should unlock
    expect(unlock.mock.calls.length).toBe(1);
  });

  test("should not execute job if no jobTask", async () => {
    const unlock = jest.fn();
    const extend = jest.fn();
    redlock.lock.mockReturnValue(Promise.resolve({ unlock, extend }));
    await service._processor({
      id: job.id,
      data: { jobTaskId: -1 }
    });

    expect(jobTaskSpy.mock.calls.length).toBe(0);

    // should not lock
    expect(redlock.lock.mock.calls.length).toBe(0);
    expect(extend.mock.calls.length).toBe(0);
    expect(unlock.mock.calls.length).toBe(0);
  });

  test("should update lock correctly", async () => {
    jest.useFakeTimers();
    processor.mockImplementationOnce(async () => {
      return new Promise(resolve => {
        const interval = setInterval(() => {
          jest.advanceTimersByTime(500);
        }, 500);

        setTimeout(() => {
          clearInterval(interval);
          resolve(true);
        }, 1000);

        jest.advanceTimersByTime(500);
      });
    });
    const unlock = jest.fn();
    const extend = jest.fn();
    redlock.lock.mockReturnValue(Promise.resolve({ unlock, extend }));

    await service._processor({
      id: job.id,
      data: { jobTaskId: job.jobTaskId }
    });

    expect(redlock.lock.mock.calls).toEqual([
      ["locks:test_service_name:1", 1000]
    ]);
    expect(extend.mock.calls).toEqual([[1000], [1000], [1000]]);
    expect(unlock.mock.calls).toEqual([[]]);
  });

  test("should handle lock errors", async () => {
    jest.useFakeTimers();
    processor.mockImplementationOnce(async () => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(true);
        }, 1500);

        jest.advanceTimersByTime(1000);
        jest.advanceTimersByTime(1000);
      });
    });
    const unlock = jest.fn();
    const extend = jest.fn().mockImplementationOnce(() => {
      throw new Error("hogehoge");
    });
    redlock.lock.mockReturnValue(Promise.resolve({ unlock, extend }));

    await service._processor({
      id: job.id,
      data: { jobTaskId: job.jobTaskId }
    });

    expect(extend.mock.calls).toEqual([[1000]]);
    expect(unlock.mock.calls).toEqual([[]]);
  });

  test("should setup scheduler if passed", async () => {
    const schedulerProcessor = () => {};
    const sheduledService = notaService(
      "test_scheduled_service_name",
      100,
      processor,
      {
        repeat: "* * */1 * *",
        processor: schedulerProcessor
      }
    );

    expect(notaScheduler.addScheduledTask.mock.calls[0][0]).toEqual(
      "test_scheduled_service_name_scheduler"
    );
    expect(notaScheduler.addScheduledTask.mock.calls[0][1]).toEqual(
      "* * */1 * *"
    );
    expect(notaScheduler.addScheduledTask.mock.calls[0][2]).toBe(
      schedulerProcessor
    );
  });
});
