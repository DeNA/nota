const { db } = require("../lib/testUtils");
const { Task, TaskItem, TaskAssignment, Annotation } = require("../models");
const taskMaintenance = require("./taskMaintenance");

let data;

beforeAll(async () => {
  data = await db.resetTestDb();
});

describe("taskMaintenance", () => {
  describe("STATUS_RESET", () => {
    let task1;
    let taskAssignment1;
    let taskAssignment2;
    let taskAssignment3;
    let taskItem1_1;
    let taskItem1_2;
    let taskItem2_1;
    let taskItem2_2;
    let taskItem2_3;
    let annotation1_1_1;
    let annotation1_1_2;
    let annotation1_1_3;
    let annotation1_2_1;
    let annotation1_2_2;
    let annotation1_2_3;
    let annotation2_1_1;
    let annotation2_1_2;
    let annotation2_2_1;
    let annotation2_2_2;
    let annotation2_2_3;
    let annotation2_2_4;

    // prettier-ignore
    beforeEach(async() => {
      data = await db.resetTestDb();
      task1 = await db.createTask({ name: "taskMaintenance_1" }); // 8
      taskAssignment1 = await db.createTaskAssignment({ taskId: task1.id, status: TaskAssignment.STATUS.DONE }); // 3
      taskAssignment2 = await db.createTaskAssignment({ taskId: task1.id, status: TaskAssignment.STATUS.ANNOTATION_READY }); // 4
      taskAssignment3 = await db.createTaskAssignment({ taskId: task1.id, status: TaskAssignment.STATUS.DONE }); // 5
      taskItem1_1 = await db.createTaskItem({ mediaItemId: 1, taskId: task1.id, taskAssignmentId: taskAssignment1.id, status: TaskItem.STATUS.DONE }); // 7
      taskItem1_2 = await db.createTaskItem({ mediaItemId: 1, taskId: task1.id, taskAssignmentId: taskAssignment1.id, status: TaskItem.STATUS.DONE }); // 8
      taskItem2_1 = await db.createTaskItem({ mediaItemId: 1, taskId: task1.id, taskAssignmentId: taskAssignment2.id, status: TaskItem.STATUS.DONE }); // 9
      taskItem2_2 = await db.createTaskItem({ mediaItemId: 1, taskId: task1.id, taskAssignmentId: taskAssignment2.id, status: TaskItem.STATUS.NOT_DONE }); //10
      taskItem2_3 = await db.createTaskItem({ mediaItemId: 1, taskId: task1.id, taskAssignmentId: taskAssignment2.id, status: TaskItem.STATUS.DONE }); //11
      annotation1_1_1 = await db.createAnnotation({ taskItemId: taskItem1_1.id, labelsName: "foo", status: Annotation.STATUS.DONE });  // 1
      annotation1_1_2 = await db.createAnnotation({ taskItemId: taskItem1_1.id, labelsName: "bar", status: Annotation.STATUS.DONE }); // 2
      annotation1_1_3 = await db.createAnnotation({ taskItemId: taskItem1_1.id, labelsName: "hoge", status: Annotation.STATUS.DONE }); // 3
      annotation1_2_1 = await db.createAnnotation({ taskItemId: taskItem1_2.id, labelsName: "foo", status: Annotation.STATUS.DONE }); // 4
      annotation1_2_2 = await db.createAnnotation({ taskItemId: taskItem1_2.id, labelsName: "foo", status: Annotation.STATUS.DONE }); // 5
      annotation1_2_3 = await db.createAnnotation({ taskItemId: taskItem1_2.id, labelsName: "hoge", status: Annotation.STATUS.DONE }); // 6
      annotation2_1_1 = await db.createAnnotation({ taskItemId: taskItem2_1.id, labelsName: "hoge", status: Annotation.STATUS.DONE }); // 7
      annotation2_1_2 = await db.createAnnotation({ taskItemId: taskItem2_1.id, labelsName: "hoge", status: Annotation.STATUS.DONE }); // 8
      annotation2_2_1 = await db.createAnnotation({ taskItemId: taskItem2_2.id, labelsName: "foo", status: Annotation.STATUS.DONE }); // 9
      annotation2_2_2 = await db.createAnnotation({ taskItemId: taskItem2_2.id, labelsName: "foo", status: Annotation.STATUS.NOT_DONE }); // 10
      annotation2_2_3 = await db.createAnnotation({ taskItemId: taskItem2_2.id, labelsName: "bar", status: Annotation.STATUS.NOT_DONE }); // 11
      annotation2_2_4 = await db.createAnnotation({ taskItemId: taskItem2_2.id, labelsName: "hoge", status: Annotation.STATUS.NOT_DONE }); // 12
    });

    const getTaskStatus = async function() {
      const taskStatus = await Task.unscoped().findByPk(task1.id, {
        attributes: ["id"],
        include: [
          {
            model: TaskItem.unscoped(),
            attributes: ["id", "status"],
            include: [
              {
                model: Annotation.unscoped(),
                attributes: ["id", "status"]
              }
            ]
          },
          {
            model: TaskAssignment.unscoped(),
            attributes: ["id", "status"]
          }
        ]
      });

      return taskStatus.get({ plain: true });
    };

    /**
     * POSSIBLE SETTINGS (TEST MATRIX)
     * 1) A true,all TI true,ongoing TA false
     * 2) A true,all TI true,all TA false
     * 3) A true,selected TI true,ongoing TA false
     * 4) A true,selected TI true,all TA false
     * 5) A true,all TI true,ongoing TA true,all
     * 6) A true,selected TI true,all TA true,ongoing
     * 7) A false TI true,ongoing TA true,ongoing => noop
     * 8) A false TI true,all TA false
     * 9) A false TI true,ongoing TA true,all
     * 10) A false TI false TA true,ongoing => noop
     * 11) A false TI false TA true,all
     */

    test("Settings 1 should work correctly", async () => {
      const result = await taskMaintenance({
        resourceId: task1.id,
        config: {
          data: {
            type: "STATUS_RESET",
            options: {
              annotations: true,
              taskItems: true,
              taskAssignments: false,
              annotationConditions: {},
              taskItemConditions: { onlyWithOngoing: true },
              taskAssignmentConditions: { onlyWithOngoing: false }
            }
          }
        },
        createdBy: 1
      });

      expect(result).toEqual({
        annotationUpdatedCount: 9,
        taskItemsUpdatedCount: 3
      });
      expect(await getTaskStatus()).toMatchSnapshot();
    });

    test("Settings 2 should work correctly", async () => {
      const result = await taskMaintenance({
        resourceId: task1.id,
        config: {
          data: {
            type: "STATUS_RESET",
            options: {
              annotations: true,
              taskItems: true,
              taskAssignments: false,
              annotationConditions: {},
              taskItemConditions: { onlyWithOngoing: false },
              taskAssignmentConditions: { onlyWithOngoing: false }
            }
          }
        },
        createdBy: 1
      });

      expect(result).toEqual({
        annotationUpdatedCount: 9,
        taskItemsUpdatedCount: 4
      });
      expect(await getTaskStatus()).toMatchSnapshot();
    });

    test("Settings 3 should work correctly, one label", async () => {
      const result = await taskMaintenance({
        resourceId: task1.id,
        config: {
          data: {
            type: "STATUS_RESET",
            options: {
              annotations: true,
              taskItems: true,
              taskAssignments: false,
              annotationConditions: { name: ["foo"] },
              taskItemConditions: { onlyWithOngoing: true },
              taskAssignmentConditions: { onlyWithOngoing: false }
            }
          }
        },
        createdBy: 1
      });

      expect(result).toEqual({
        annotationUpdatedCount: 4,
        taskItemsUpdatedCount: 2
      });
      expect(await getTaskStatus()).toMatchSnapshot();
    });

    test("Settings 3 should work correctly, multiple label", async () => {
      const result = await taskMaintenance({
        resourceId: task1.id,
        config: {
          data: {
            type: "STATUS_RESET",
            options: {
              annotations: true,
              taskItems: true,
              taskAssignments: false,
              annotationConditions: { name: ["foo", "bar"] },
              taskItemConditions: { onlyWithOngoing: true },
              taskAssignmentConditions: { onlyWithOngoing: false }
            }
          }
        },
        createdBy: 1
      });

      expect(result).toEqual({
        annotationUpdatedCount: 5,
        taskItemsUpdatedCount: 2
      });
      expect(await getTaskStatus()).toMatchSnapshot();
    });

    test("Settings 4 should work correctly", async () => {
      const result = await taskMaintenance({
        resourceId: task1.id,
        config: {
          data: {
            type: "STATUS_RESET",
            options: {
              annotations: true,
              taskItems: true,
              taskAssignments: false,
              annotationConditions: { name: ["foo"] },
              taskItemConditions: { onlyWithOngoing: false },
              taskAssignmentConditions: { onlyWithOngoing: false }
            }
          }
        },
        createdBy: 1
      });

      expect(result).toEqual({
        annotationUpdatedCount: 4,
        taskItemsUpdatedCount: 4
      });
      expect(await getTaskStatus()).toMatchSnapshot();
    });

    test("Settings 5 should work correctly", async () => {
      const result = await taskMaintenance({
        resourceId: task1.id,
        config: {
          data: {
            type: "STATUS_RESET",
            options: {
              annotations: true,
              taskItems: true,
              taskAssignments: true,
              annotationConditions: {},
              taskItemConditions: { onlyWithOngoing: true },
              taskAssignmentConditions: { onlyWithOngoing: false }
            }
          }
        },
        createdBy: 1
      });

      expect(result).toEqual({
        annotationUpdatedCount: 9,
        taskItemsUpdatedCount: 3,
        taskAssignmentsUpdatedCount: 2
      });
      expect(await getTaskStatus()).toMatchSnapshot();
    });

    test("Settings 6 should work correctly", async () => {
      const result = await taskMaintenance({
        resourceId: task1.id,
        config: {
          data: {
            type: "STATUS_RESET",
            options: {
              annotations: true,
              taskItems: true,
              taskAssignments: true,
              annotationConditions: { name: ["foo"] },
              taskItemConditions: { onlyWithOngoing: false },
              taskAssignmentConditions: { onlyWithOngoing: true }
            }
          }
        },
        createdBy: 1
      });

      expect(result).toEqual({
        annotationUpdatedCount: 4,
        taskItemsUpdatedCount: 4,
        taskAssignmentsUpdatedCount: 1
      });
      expect(await getTaskStatus()).toMatchSnapshot();
    });

    test("Settings 7 should work correctly", async () => {
      const result = await taskMaintenance({
        resourceId: task1.id,
        config: {
          data: {
            type: "STATUS_RESET",
            options: {
              annotations: false,
              taskItems: true,
              taskAssignments: true,
              annotationConditions: { name: ["foo"] },
              taskItemConditions: { onlyWithOngoing: true },
              taskAssignmentConditions: { onlyWithOngoing: true }
            }
          }
        },
        createdBy: 1
      });

      expect(result).toEqual({
        taskAssignmentsUpdatedCount: 0,
        taskItemsUpdatedCount: 0
      });
      expect(await getTaskStatus()).toMatchSnapshot();
    });

    test("Settings 8 should work correctly", async () => {
      const result = await taskMaintenance({
        resourceId: task1.id,
        config: {
          data: {
            type: "STATUS_RESET",
            options: {
              annotations: false,
              taskItems: true,
              taskAssignments: false,
              annotationConditions: { name: ["foo"] },
              taskItemConditions: { onlyWithOngoing: false },
              taskAssignmentConditions: { onlyWithOngoing: true }
            }
          }
        },
        createdBy: 1
      });

      expect(result).toEqual({
        taskItemsUpdatedCount: 4
      });
      expect(await getTaskStatus()).toMatchSnapshot();
    });

    test("Settings 9 should work correctly", async () => {
      const result = await taskMaintenance({
        resourceId: task1.id,
        config: {
          data: {
            type: "STATUS_RESET",
            options: {
              annotations: false,
              taskItems: true,
              taskAssignments: true,
              annotationConditions: { name: ["foo"] },
              taskItemConditions: { onlyWithOngoing: true },
              taskAssignmentConditions: { onlyWithOngoing: false }
            }
          }
        },
        createdBy: 1
      });

      expect(result).toEqual({
        taskItemsUpdatedCount: 0,
        taskAssignmentsUpdatedCount: 2
      });
      expect(await getTaskStatus()).toMatchSnapshot();
    });

    test("Settings 10 should work correctly", async () => {
      const result = await taskMaintenance({
        resourceId: task1.id,
        config: {
          data: {
            type: "STATUS_RESET",
            options: {
              annotations: false,
              taskItems: false,
              taskAssignments: true,
              annotationConditions: { name: ["foo"] },
              taskItemConditions: { onlyWithOngoing: false },
              taskAssignmentConditions: { onlyWithOngoing: true }
            }
          }
        },
        createdBy: 1
      });

      expect(result).toEqual({
        taskAssignmentsUpdatedCount: 0
      });
      expect(await getTaskStatus()).toMatchSnapshot();
    });

    test("Settings 11 should work correctly", async () => {
      const result = await taskMaintenance({
        resourceId: task1.id,
        config: {
          data: {
            type: "STATUS_RESET",
            options: {
              annotations: false,
              taskItems: false,
              taskAssignments: true,
              annotationConditions: { name: ["foo"] },
              taskItemConditions: { onlyWithOngoing: false },
              taskAssignmentConditions: { onlyWithOngoing: false }
            }
          }
        },
        createdBy: 1
      });

      expect(result).toEqual({
        taskAssignmentsUpdatedCount: 2
      });
      expect(await getTaskStatus()).toMatchSnapshot();
    });
  });
});
