jest.mock("../lib/redisClient");
jest.mock("bullmq");

const notaScheduler = require("./notaScheduler");

describe("notaScheduler", () => {
  let processor;

  beforeAll(async () => {
    processor = jest.fn(async () => {
      return { hoge: "hoge" };
    });
    notaScheduler._queue.getRepeatableJobs.mockReturnValue([
      { key: "foo", name: "foo" },
      { key: "bar", name: "bar" }
    ]);
  });

  afterEach(() => {
    notaScheduler._queue.add.mockClear();
  });

  test("should work correctly", async () => {
    const queue = notaScheduler._queue;

    // add scheduled task
    const processor1 = jest.fn();
    await notaScheduler.addScheduledTask(
      "test_task_1",
      "* */1 * * *",
      processor1
    );

    // start
    await notaScheduler.start();
    expect(queue.add.mock.calls).toEqual([
      [
        "test_task_1",
        {},
        { removeOnComplete: 100, removeOnFail: 100, repeat: "* */1 * * *" }
      ]
    ]);
    expect(queue.removeRepeatableByKey.mock.calls).toEqual([["foo"], ["bar"]]);
    queue.add.mockClear();
    queue.removeRepeatableByKey.mockClear();

    // add other scheduled task
    const processor2 = jest.fn();
    await notaScheduler.addScheduledTask(
      "test_task_2",
      "* */1 */1 * *",
      processor2
    );

    // start again
    await notaScheduler.start();
    expect(queue.add.mock.calls).toEqual([
      [
        "test_task_1",
        {},
        { removeOnComplete: 100, removeOnFail: 100, repeat: "* */1 * * *" }
      ],
      [
        "test_task_2",
        {},
        { removeOnComplete: 100, removeOnFail: 100, repeat: "* */1 */1 * *" }
      ]
    ]);
    expect(queue.removeRepeatableByKey.mock.calls).toEqual([["foo"], ["bar"]]);
    queue.add.mockClear();
    queue.removeRepeatableByKey.mockClear();

    // process
    await notaScheduler._processor({ name: "test_task_1" });
    expect(processor1.mock.calls.length).toBe(1);
    expect(processor2.mock.calls.length).toBe(0);
    processor1.mockClear();

    await notaScheduler._processor({ name: "test_task_2" });
    expect(processor1.mock.calls.length).toBe(0);
    expect(processor2.mock.calls.length).toBe(1);
    processor2.mockClear();

    await notaScheduler._processor({ name: "hoge" });
    expect(processor1.mock.calls.length).toBe(0);
    expect(processor2.mock.calls.length).toBe(0);

    // stop
    await notaScheduler.stop();
    expect(queue.removeRepeatableByKey.mock.calls).toEqual([["foo"], ["bar"]]);
  });
});
