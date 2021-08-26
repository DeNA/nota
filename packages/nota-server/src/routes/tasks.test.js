jest.mock("../services/notaService");
jest.mock("../lib/datasource");

const request = require("supertest");
const app = require("../app");
const { db } = require("../lib/testUtils");
const { Task, TaskAssignment, JobTask, Project } = require("../models");
const datasource = require("../lib/datasource");
const jobInitializeService = require("../services/taskInitializeService");
const taskExportService = require("../services/taskExportService");

let data;

beforeAll(async () => {
  await db.resetTestDb();
  data = await db.generateTestData();
});

describe("/api/projects/:projectId/tasks", () => {
  describe("GET /", () => {
    test("Should receive task list (project admin)", async () => {
      const response = await request(app)
        .get(`/api/projects/1/tasks`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.adminUser.userTokens[0].token}`])
        .send();

      expect(response.status).toBe(200);
      expect(response.body[0]).toMatchObject({
        id: data.tasks.task1.id,
        name: data.tasks.task1.name,
        projectId: data.tasks.task1.projectId,
        template: {
          id: data.taskTemplates.template1.id,
          name: data.taskTemplates.template1.name
        },
        status: data.tasks.task1.status,
        done: 2,
        total: 6,
        assignable: 2,
        createdBy: {
          id: data.users.adminUser.id,
          username: data.users.adminUser.username
        },
        updatedBy: {
          id: data.users.adminUser.id,
          username: data.users.adminUser.username
        },
        mediaSource: {
          id: data.mediaSources.mediaSource1.id,
          name: data.mediaSources.mediaSource1.name
        },
        mediaSourceConditions: [
          { label: "String", value: "foo" },
          { label: "Integer", value: [0, 10] },
          { label: "Date", value: null }
        ],
        mediaSourceOptions: {
          path: "files1",
          excludeAlreadyUsed: true,
          limit: 5000
        }
      });
      expect(response.body[1]).toMatchObject({
        id: data.tasks.task2.id,
        name: data.tasks.task2.name,
        projectId: data.tasks.task2.projectId,
        template: {
          id: data.taskTemplates.template1.id,
          name: data.taskTemplates.template1.name
        },
        status: data.tasks.task2.status,
        done: 0,
        total: 0,
        assignable: 0,
        createdBy: { id: 4, username: "admin_user" },
        updatedBy: { id: 4, username: "admin_user" },
        mediaSource: {
          id: data.mediaSources.mediaSource1.id,
          name: data.mediaSources.mediaSource1.name
        },
        mediaSourceConditions: [
          { label: "String", value: null },
          { label: "Integer", value: null },
          { label: "Date", value: null }
        ],
        mediaSourceOptions: {
          path: "files1",
          excludeAlreadyUsed: false,
          limit: null
        }
      });
    });
    test("Should receive task list (app admin)", async () => {
      const response = await request(app)
        .get(`/api/projects/1/tasks`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.appadminUser.userTokens[0].token}`])
        .send();

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(4);
      expect(response.body[0].id).toBe(data.tasks.task1.id);
      expect(response.body[1].id).toBe(data.tasks.task2.id);
      expect(response.body[2].id).toBe(data.tasks.task3.id);
      expect(response.body[3].id).toBe(data.tasks.task4.id);
    });
    test("Should receive task list (super admin)", async () => {
      const response = await request(app)
        .get(`/api/projects/1/tasks`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.superadminUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(4);
      expect(response.body[0].id).toBe(data.tasks.task1.id);
      expect(response.body[1].id).toBe(data.tasks.task2.id);
      expect(response.body[2].id).toBe(data.tasks.task3.id);
      expect(response.body[3].id).toBe(data.tasks.task4.id);
    });
    test("Should not receive task list (different project admin)", async () => {
      const response = await request(app)
        .get(`/api/projects/1/tasks`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.differentAdminUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(404);
      expect(response.body.message).toBeTruthy();
    });
    test("Should not receive task list (annotator)", async () => {
      const response = await request(app)
        .get(`/api/projects/1/tasks`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.annotatorUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(404);
      expect(response.body.message).toBeTruthy();
    });
    test("Should not receive task list (normal)", async () => {
      const response = await request(app)
        .get(`/api/projects/1/tasks`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.normalUser.userTokens[0].token}`])
        .send();

      expect(response.status).toBe(404);
      expect(response.body.message).toBeTruthy();
    });
    test("should return 401 if not authorized", async () => {
      const response = await request(app)
        .get(`/api/projects/1/tasks`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=foobar`])
        .send();

      expect(response.status).toBe(401);
      expect(response.body).toEqual({});
    });
    test("should return 5xx if error happens", async () => {
      const spy = jest.spyOn(Task, "findAll");
      spy.mockImplementationOnce(() => {
        throw new Error();
      });
      const response = await request(app)
        .get(`/api/projects/1/tasks`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.superadminUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(500);
      expect(response.body.message).toBeTruthy();

      spy.mockRestore();
    });
  });

  describe("GET /:id", () => {
    test("Should receive task details (project admin)", async () => {
      const response = await request(app)
        .get(`/api/projects/1/tasks/1`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.adminUser.userTokens[0].token}`])
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: data.tasks.task1.id,
        name: data.tasks.task1.name,
        projectId: data.tasks.task1.projectId,
        template: {
          id: data.taskTemplates.template1.id,
          name: data.taskTemplates.template1.name
        },
        status: data.tasks.task1.status,
        done: 2,
        total: 6,
        assignable: 2,
        createdBy: {
          id: data.users.adminUser.id,
          username: data.users.adminUser.username
        },
        updatedBy: {
          id: data.users.adminUser.id,
          username: data.users.adminUser.username
        },
        mediaSource: {
          id: data.mediaSources.mediaSource1.id,
          name: data.mediaSources.mediaSource1.name
        },
        mediaSourceConditions: [
          { label: "String", value: "foo" },
          { label: "Integer", value: [0, 10] },
          { label: "Date", value: null }
        ],
        mediaSourceOptions: {
          path: "files1",
          excludeAlreadyUsed: true,
          limit: 5000
        }
      });
      expect(response.body.assignments.length).toBe(2);
      expect(response.body.assignments[0]).toMatchObject({
        id: data.taskAssignments.taskAssignment1.id,
        annotator: {
          id: data.users.annotatorUser.id,
          username: data.users.annotatorUser.username
        },
        status: data.taskAssignments.taskAssignment1.status,
        done: 2,
        total: 2
      });
      expect(response.body.assignments[1]).toMatchObject({
        id: data.taskAssignments.taskAssignment2.id,
        annotator: {
          id: data.users.annotatorUser.id,
          username: data.users.annotatorUser.username
        },
        status: data.taskAssignments.taskAssignment2.status,
        done: 0,
        total: 2
      });
      expect(response.body.fetchJobs.length).toBe(3);
      expect(response.body.fetchJobs[0]).toMatchObject(
        JSON.parse(JSON.stringify(data.jobTasks.jobTask_taskFetch3))
      );
      expect(response.body.fetchJobs[1]).toMatchObject(
        JSON.parse(JSON.stringify(data.jobTasks.jobTask_taskFetch2))
      );
      expect(response.body.fetchJobs[2]).toMatchObject(
        JSON.parse(JSON.stringify(data.jobTasks.jobTask_taskFetch1))
      );
      expect(response.body.exportJobs.length).toBe(3);
      expect(response.body.exportJobs[0]).toMatchObject(
        JSON.parse(JSON.stringify(data.jobTasks.jobTask_taskExport3))
      );
      expect(response.body.exportJobs[1]).toMatchObject(
        JSON.parse(JSON.stringify(data.jobTasks.jobTask_taskExport2))
      );
      expect(response.body.exportJobs[2]).toMatchObject(
        JSON.parse(JSON.stringify(data.jobTasks.jobTask_taskExport1))
      );
    });
    test("Should receive task details (app admin)", async () => {
      const response = await request(app)
        .get(`/api/projects/1/tasks/1`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.appadminUser.userTokens[0].token}`])
        .send();

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(data.tasks.task1.id);
    });
    test("Should receive task details (super admin)", async () => {
      const response = await request(app)
        .get(`/api/projects/1/tasks/1`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.superadminUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(data.tasks.task1.id);
    });
    test("Should not receive task details (different project admin)", async () => {
      const response = await request(app)
        .get(`/api/projects/1/tasks/1`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.differentAdminUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(404);
      expect(response.body.message).toBeTruthy();
    });
    test("Should not receive task details (annotator)", async () => {
      const response = await request(app)
        .get(`/api/projects/1/tasks/1`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.annotatorUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(404);
      expect(response.body.message).toBeTruthy();
    });
    test("Should not receive task details (normal)", async () => {
      const response = await request(app)
        .get(`/api/projects/1/tasks/1`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.normalUser.userTokens[0].token}`])
        .send();

      expect(response.status).toBe(404);
      expect(response.body.message).toBeTruthy();
    });
    test("should return 401 if not authorized", async () => {
      const response = await request(app)
        .get(`/api/projects/1/tasks/1`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=foobar`])
        .send();

      expect(response.status).toBe(401);
      expect(response.body).toEqual({});
    });
    test("should return 5xx if error happens", async () => {
      const spy = jest.spyOn(TaskAssignment, "findAll");
      spy.mockImplementationOnce(() => {
        throw new Error();
      });
      const response = await request(app)
        .get(`/api/projects/1/tasks/1`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.superadminUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(500);
      expect(response.body.message).toBeTruthy();

      spy.mockRestore();
    });
  });

  describe("POST /", () => {
    let newTask;

    beforeAll(async () => {
      newTask = {
        name: "new_task",
        description: "new_task_description",
        mediaSourceId: data.mediaSources.mediaSource1.id,
        options: {
          taskTemplateId: data.taskTemplates.template1.id,
          path: "foo/bar/path",
          excludeAlreadyUsed: false,
          limit: 500
        },
        conditions: { filter_string: "aaa" }
      };
    });
    afterAll(async () => {
      await db.resetTestDb();
      data = await db.generateTestData();
    });

    test("Should queue task creation job (super admin)", async () => {
      const spy = jest.spyOn(jobInitializeService, "add");

      const response = await request(app)
        .post(`/api/projects/1/tasks`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.superadminUser.userTokens[0].token}`
        ])
        .send(newTask);

      const task = await Task.findByPk(response.body.id, { raw: true });

      expect(task).toMatchObject({
        id: response.body.id,
        status: Task.STATUS.CREATING,
        createdBy: data.users.superadminUser.id,
        description: "new_task_description",
        isExportScheduled: 0,
        isFetchScheduled: 0,
        mediaSourceConfig: JSON.stringify({
          options: {
            path: "foo/bar/path",
            excludeAlreadyUsed: false,
            limit: 500
          },
          conditions: { filter_string: "aaa" }
        }),
        mediaSourceId: 1,
        name: "new_task",
        projectId: 1,
        taskTemplateId: 1
      });
      expect(spy.mock.calls.length).toBe(1);
      expect(spy.mock.calls[0]).toEqual([
        {
          data: { refresh: false },
          projectId: 1,
          resourceId: response.body.id,
          userId: data.users.superadminUser.id
        }
      ]);

      spy.mockRestore();
    });

    test("Should queue task creation job (app admin)", async () => {
      const response = await request(app)
        .post(`/api/projects/1/tasks`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.appadminUser.userTokens[0].token}`])
        .send(newTask);

      const task = await Task.findByPk(response.body.id, { raw: true });

      expect(task.id).toBe(response.body.id);
    });
    test("Should queue task creation job (project admin)", async () => {
      const response = await request(app)
        .post(`/api/projects/1/tasks`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.adminUser.userTokens[0].token}`])
        .send(newTask);

      const task = await Task.findByPk(response.body.id, { raw: true });

      expect(task.id).toBe(response.body.id);
    });

    test("Should validate taskTemplate", async () => {
      const response = await request(app)
        .post(`/api/projects/1/tasks`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.adminUser.userTokens[0].token}`])
        .send({
          ...newTask,
          options: { ...newTask.options, taskTemplateId: -1 }
        });

      expect(response.status).toBe(400);
      expect(response.body.id).toBeUndefined();
    });

    test("Should validate mediaSource", async () => {
      const response = await request(app)
        .post(`/api/projects/1/tasks`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.adminUser.userTokens[0].token}`])
        .send({ ...newTask, mediaSourceId: -1 });
    });

    test("Should not queue task creation job (annotator)", async () => {
      const response = await request(app)
        .post(`/api/projects/1/tasks`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.annotatorUser.userTokens[0].token}`
        ])
        .send(newTask);

      expect(response.status).toBe(404);
      expect(response.body.message).toBeTruthy();
    });

    test("Should not queue task creation job (different admin)", async () => {
      const response = await request(app)
        .post(`/api/projects/1/tasks`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.differentAdminUser.userTokens[0].token}`
        ])
        .send(newTask);

      expect(response.status).toBe(404);
      expect(response.body.message).toBeTruthy();
    });

    test("Should not queue task creation job (normal)", async () => {
      const response = await request(app)
        .post(`/api/projects/1/tasks`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.normalUser.userTokens[0].token}`])
        .send(newTask);

      expect(response.status).toBe(404);
      expect(response.body.message).toBeTruthy();
    });

    test("should return 401 if not authorized", async () => {
      const response = await request(app)
        .post(`/api/projects/1/tasks`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=foobar`])
        .send(newTask);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({});
    });
    test("should return 5xx if error happens", async () => {
      const spy = jest.spyOn(Project.prototype, "createTask");
      spy.mockImplementationOnce(() => {
        throw new Error();
      });
      const response = await request(app)
        .post(`/api/projects/1/tasks`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.adminUser.userTokens[0].token}`])
        .send(newTask);

      expect(response.status).toBe(500);
      expect(response.body.message).toBeTruthy();

      spy.mockRestore();
    });
  });
  describe("PUT /:id", () => {
    afterAll(async () => {
      await db.resetTestDb();
      data = await db.generateTestData();
    });

    test("Should be able to update name/description/status (super admin)", async () => {
      const response = await request(app)
        .put(`/api/projects/1/tasks/${data.tasks.task1.id}`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.superadminUser.userTokens[0].token}`
        ])
        .send({
          name: "newName1",
          description: "newDescription1",
          status: Task.STATUS.HIDDEN
        });

      expect(response.body).toMatchObject({
        assignable: 0,
        createdBy: {
          id: data.users.adminUser.id,
          username: data.users.adminUser.username
        },
        description: "newDescription1",
        done: null,
        id: 1,
        name: "newName1",
        projectId: 1,
        status: Task.STATUS.HIDDEN,
        updatedBy: {
          id: data.users.superadminUser.id,
          username: data.users.superadminUser.username
        }
      });
    });
    test("Should be able to update name/description/status (project admin)", async () => {
      const response = await request(app)
        .put(`/api/projects/1/tasks/${data.tasks.task1.id}`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.adminUser.userTokens[0].token}`])
        .send({
          name: "newName2",
          description: "newDescription2",
          status: Task.STATUS.DONE
        });

      expect(response.body).toMatchObject({
        assignable: 0,
        createdBy: {
          id: data.users.adminUser.id,
          username: data.users.adminUser.username
        },
        description: "newDescription2",
        done: null,
        id: 1,
        name: "newName2",
        projectId: 1,
        status: Task.STATUS.DONE,
        updatedBy: {
          id: data.users.adminUser.id,
          username: data.users.adminUser.username
        }
      });
    });
    test("Should be able to update name/description/status (app admin)", async () => {
      const response = await request(app)
        .put(`/api/projects/1/tasks/${data.tasks.task1.id}`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.appadminUser.userTokens[0].token}`])
        .send({
          name: "newName3",
          description: "newDescription3",
          status: Task.STATUS.READY
        });

      expect(response.body).toMatchObject({
        assignable: 0,
        createdBy: {
          id: data.users.adminUser.id,
          username: data.users.adminUser.username
        },
        description: "newDescription3",
        done: null,
        id: 1,
        name: "newName3",
        projectId: 1,
        status: Task.STATUS.READY,
        updatedBy: {
          id: data.users.appadminUser.id,
          username: data.users.appadminUser.username
        }
      });
    });

    test("Should update status only to/from READY/HIDDEN/DONE", async () => {
      const taskDELETED = await db.createTask({ status: Task.STATUS.DELETED });
      const taskUPDATING_ERROR = await db.createTask({
        status: Task.STATUS.UPDATING_ERROR
      });
      const taskCREATING_ERROR = await db.createTask({
        status: Task.STATUS.CREATING_ERROR
      });
      const taskCREATING = await db.createTask({
        status: Task.STATUS.CREATING
      });
      const taskUPDATING = await db.createTask({
        status: Task.STATUS.UPDATING
      });
      const taskHIDDEN = await db.createTask({ status: Task.STATUS.HIDDEN });
      const taskREADY = await db.createTask({ status: Task.STATUS.READY });
      const taskDONE = await db.createTask({ status: Task.STATUS.DONE });

      const responseDELETED_READY = await request(app)
        .put(`/api/projects/1/tasks/${taskDELETED.id}`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.appadminUser.userTokens[0].token}`])
        .send({ status: Task.STATUS.READY });
      const responseUPDATING_ERROR_HIDDEN = await request(app)
        .put(`/api/projects/1/tasks/${taskUPDATING_ERROR.id}`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.appadminUser.userTokens[0].token}`])
        .send({ status: Task.STATUS.HIDDEN });
      const responseCREATING_ERROR_DONE = await request(app)
        .put(`/api/projects/1/tasks/${taskCREATING_ERROR.id}`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.appadminUser.userTokens[0].token}`])
        .send({ status: Task.STATUS.DONE });
      const responseCREATING_UPDATING = await request(app)
        .put(`/api/projects/1/tasks/${taskCREATING.id}`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.appadminUser.userTokens[0].token}`])
        .send({ status: Task.STATUS.UPDATING });
      const responseUPDATING_DELETED = await request(app)
        .put(`/api/projects/1/tasks/${taskUPDATING.id}`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.appadminUser.userTokens[0].token}`])
        .send({ status: Task.STATUS.DELETED });

      const responseHIDDEN_DELETED = await request(app)
        .put(`/api/projects/1/tasks/${taskHIDDEN.id}`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.appadminUser.userTokens[0].token}`])
        .send({ status: Task.STATUS.DELETED });
      const responseREADY_CREATING = await request(app)
        .put(`/api/projects/1/tasks/${taskREADY.id}`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.appadminUser.userTokens[0].token}`])
        .send({ status: Task.STATUS.CREATING });
      const responseDONE_UPDATING = await request(app)
        .put(`/api/projects/1/tasks/${taskDONE.id}`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.appadminUser.userTokens[0].token}`])
        .send({ status: Task.STATUS.UPDATING });

      expect(responseDELETED_READY.status).toBe(404);
      expect(responseUPDATING_ERROR_HIDDEN.body.status).toBe(
        Task.STATUS.UPDATING_ERROR
      );
      expect(responseCREATING_ERROR_DONE.body.status).toBe(
        Task.STATUS.CREATING_ERROR
      );
      expect(responseCREATING_UPDATING.body.status).toBe(Task.STATUS.CREATING);
      expect(responseUPDATING_DELETED.body.status).toBe(Task.STATUS.UPDATING);
      expect(responseHIDDEN_DELETED.body.status).toBe(Task.STATUS.HIDDEN);
      expect(responseREADY_CREATING.body.status).toBe(Task.STATUS.READY);
      expect(responseDONE_UPDATING.body.status).toBe(Task.STATUS.DONE);
    });

    test("Should not update task (annotator)", async () => {
      const response = await request(app)
        .post(`/api/projects/1/tasks/${data.tasks.task1.id}`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.annotatorUser.userTokens[0].token}`
        ])
        .send({ name: "newName1", description: "newDescription1" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBeTruthy();
    });
    test("Should not update task (normal)", async () => {
      const response = await request(app)
        .post(`/api/projects/1/tasks/${data.tasks.task1.id}`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.normalUser.userTokens[0].token}`])
        .send({ name: "newName1", description: "newDescription1" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBeTruthy();
    });
    test("Should not update task (different)", async () => {
      const response = await request(app)
        .post(`/api/projects/1/tasks/${data.tasks.task1.id}`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.differentAdminUser.userTokens[0].token}`
        ])
        .send({ name: "newName1", description: "newDescription1" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBeTruthy();
    });

    test("should return 401 if not authorized", async () => {
      const response = await request(app)
        .put(`/api/projects/1/tasks/${data.tasks.task1.id}`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=foobar`])
        .send({ name: "newName1", description: "newDescription1" });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({});
    });
    test("should return 5xx if error happens", async () => {
      const spy = jest.spyOn(Task.prototype, "update");
      spy.mockImplementationOnce(() => {
        throw new Error();
      });
      const response = await request(app)
        .put(`/api/projects/1/tasks/${data.tasks.task1.id}`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.adminUser.userTokens[0].token}`])
        .send({ name: "newName1", description: "newDescription1" });

      expect(response.status).toBe(500);
      expect(response.body.message).toBeTruthy();

      spy.mockRestore();
    });
  });
  describe("DELETE /:id", () => {
    afterAll(async () => {
      await db.resetTestDb();
      data = await db.generateTestData();
    });

    test("Should be able to delete task (super admin)", async () => {
      const taskREADY = await db.createTask({ status: Task.STATUS.READY });
      const response = await request(app)
        .delete(`/api/projects/1/tasks/${taskREADY.id}`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.superadminUser.userTokens[0].token}`
        ])
        .send();

      const task = await Task.scope("raw").findByPk(taskREADY.id);

      expect(task.status).toEqual(Task.STATUS.DELETED);
      expect(task.updatedBy).toEqual(data.users.superadminUser.id);
      expect(response.status).toEqual(204);
      expect(response.body).toEqual({});
    });
    test("Should be able to delete task (project admin)", async () => {
      const taskREADY = await db.createTask({ status: Task.STATUS.READY });
      const response = await request(app)
        .delete(`/api/projects/1/tasks/${taskREADY.id}`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.adminUser.userTokens[0].token}`])
        .send();

      const task = await Task.scope("raw").findByPk(taskREADY.id);

      expect(task.status).toEqual(Task.STATUS.DELETED);
      expect(task.updatedBy).toEqual(data.users.adminUser.id);
      expect(response.status).toEqual(204);
      expect(response.body).toEqual({});
    });
    test("Should be able to delete task (app admin)", async () => {
      const taskREADY = await db.createTask({ status: Task.STATUS.READY });
      const response = await request(app)
        .delete(`/api/projects/1/tasks/${taskREADY.id}`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.appadminUser.userTokens[0].token}`])
        .send();

      const task = await Task.scope("raw").findByPk(taskREADY.id);

      expect(task.status).toEqual(Task.STATUS.DELETED);
      expect(task.updatedBy).toEqual(data.users.appadminUser.id);
      expect(response.status).toEqual(204);
      expect(response.body).toEqual({});
    });

    test("Should not be able to delete (annotator)", async () => {
      const taskREADY = await db.createTask({ status: Task.STATUS.READY });
      const response = await request(app)
        .delete(`/api/projects/1/tasks/${taskREADY.id}`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.annotatorUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(404);
      expect(response.body.message).toBeTruthy();
    });
    test("Should not be able to delete (normal)", async () => {
      const taskREADY = await db.createTask({ status: Task.STATUS.READY });
      const response = await request(app)
        .delete(`/api/projects/1/tasks/${taskREADY.id}`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.normalUser.userTokens[0].token}`])
        .send();

      expect(response.status).toBe(404);
      expect(response.body.message).toBeTruthy();
    });
    test("Should not be able to delete (different)", async () => {
      const taskREADY = await db.createTask({ status: Task.STATUS.READY });
      const response = await request(app)
        .delete(`/api/projects/1/tasks/${taskREADY.id}`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.differentAdminUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(404);
      expect(response.body.message).toBeTruthy();
    });

    test("Should not be able to delete if status is CREATING", async () => {
      const taskCREATING = await db.createTask({
        status: Task.STATUS.CREATING
      });
      const response = await request(app)
        .delete(`/api/projects/1/tasks/${taskCREATING.id}`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.appadminUser.userTokens[0].token}`])
        .send();

      const task = await Task.scope("raw").findByPk(taskCREATING.id);

      expect(task.status).toEqual(Task.STATUS.CREATING);
      expect(task.updatedBy).toEqual(1);
      expect(response.status).toBe(400);
      expect(response.body.message).toBeTruthy();
    });
    test("Should not be able to delete if status is DELETED", async () => {
      const taskDELETED = await db.createTask({
        status: Task.STATUS.DELETED
      });
      const response = await request(app)
        .delete(`/api/projects/1/tasks/${taskDELETED.id}`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.appadminUser.userTokens[0].token}`])
        .send();

      const task = await Task.scope("raw").findByPk(taskDELETED.id);

      expect(task.status).toEqual(Task.STATUS.DELETED);
      expect(task.updatedBy).toEqual(1);
      expect(response.status).toBe(404);
      expect(response.body.message).toBeTruthy();
    });

    test("should return 401 if not authorized", async () => {
      const taskREADY = await db.createTask({ status: Task.STATUS.READY });
      const response = await request(app)
        .delete(`/api/projects/1/tasks/${taskREADY.id}`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=foobar`])
        .send();

      expect(response.status).toBe(401);
      expect(response.body).toEqual({});
    });
    test("should return 5xx if error happens", async () => {
      const spy = jest.spyOn(Task.prototype, "softDelete");
      spy.mockImplementationOnce(() => {
        throw new Error();
      });
      const taskREADY = await db.createTask({ status: Task.STATUS.READY });
      const response = await request(app)
        .delete(`/api/projects/1/tasks/${taskREADY.id}`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.adminUser.userTokens[0].token}`])
        .send();

      expect(response.status).toBe(500);
      expect(response.body.message).toBeTruthy();

      spy.mockRestore();
    });
  });
  describe("POST /:id/refreshTaskItems", () => {
    afterAll(async () => {
      await db.resetTestDb();
      data = await db.generateTestData();
    });

    test("Should queue task refresh job (super admin)", async () => {
      const spy = jest.spyOn(jobInitializeService, "add");

      const response = await request(app)
        .post(`/api/projects/1/tasks/${data.tasks.task1.id}/refreshTaskItems`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.superadminUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(204);
      expect(spy.mock.calls.length).toBe(1);
      expect(spy.mock.calls[0]).toEqual([
        {
          data: { refresh: true },
          projectId: 1,
          resourceId: data.tasks.task1.id,
          userId: data.users.superadminUser.id
        }
      ]);

      spy.mockRestore();
    });
    test("Should queue task refresh job (app admin)", async () => {
      const spy = jest.spyOn(jobInitializeService, "add");

      const response = await request(app)
        .post(`/api/projects/1/tasks/${data.tasks.task1.id}/refreshTaskItems`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.appadminUser.userTokens[0].token}`])
        .send();

      expect(response.status).toBe(204);
      expect(spy.mock.calls.length).toBe(1);
      expect(spy.mock.calls[0]).toEqual([
        {
          data: { refresh: true },
          projectId: 1,
          resourceId: data.tasks.task1.id,
          userId: data.users.appadminUser.id
        }
      ]);

      spy.mockRestore();
    });
    test("Should queue task refresh job (project admin)", async () => {
      const spy = jest.spyOn(jobInitializeService, "add");

      const response = await request(app)
        .post(`/api/projects/1/tasks/${data.tasks.task1.id}/refreshTaskItems`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.adminUser.userTokens[0].token}`])
        .send();

      expect(response.status).toBe(204);
      expect(spy.mock.calls.length).toBe(1);
      expect(spy.mock.calls[0]).toEqual([
        {
          data: { refresh: true },
          projectId: 1,
          resourceId: data.tasks.task1.id,
          userId: data.users.adminUser.id
        }
      ]);

      spy.mockRestore();
    });

    test("Should not queue task refresh job (annotator)", async () => {
      const response = await request(app)
        .post(`/api/projects/1/tasks/${data.tasks.task1.id}/refreshTaskItems`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.annotatorUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(404);
      expect(response.body.message).toBeTruthy();
    });

    test("Should not queue task refresh job (different admin)", async () => {
      const response = await request(app)
        .post(`/api/projects/1/tasks/${data.tasks.task1.id}/refreshTaskItems`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.differentAdminUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(404);
      expect(response.body.message).toBeTruthy();
    });

    test("Should not queue task creation job (normal)", async () => {
      const response = await request(app)
        .post(`/api/projects/1/tasks/${data.tasks.task1.id}/refreshTaskItems`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.normalUser.userTokens[0].token}`])
        .send();

      expect(response.status).toBe(404);
      expect(response.body.message).toBeTruthy();
    });

    test("should return 401 if not authorized", async () => {
      const response = await request(app)
        .post(`/api/projects/1/tasks/${data.tasks.task1.id}/refreshTaskItems`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=foobar`])
        .send();

      expect(response.status).toBe(401);
      expect(response.body).toEqual({});
    });
    test("should return 5xx if error happens", async () => {
      const spy = jest.spyOn(jobInitializeService, "add");
      spy.mockImplementationOnce(() => {
        throw new Error();
      });
      const response = await request(app)
        .post(`/api/projects/1/tasks/${data.tasks.task1.id}/refreshTaskItems`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.adminUser.userTokens[0].token}`])
        .send();

      expect(response.status).toBe(500);
      expect(response.body.message).toBeTruthy();

      spy.mockRestore();
    });
  });

  describe("POST /:id/export", () => {
    afterAll(async () => {
      await db.resetTestDb();
      data = await db.generateTestData();
    });

    test("Should queue task export job (super admin)", async () => {
      const spy = jest.spyOn(taskExportService, "add");

      const response = await request(app)
        .post(`/api/projects/1/tasks/${data.tasks.task1.id}/export`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.superadminUser.userTokens[0].token}`
        ])
        .send({
          target: Task.EXPORT_TARGET.ALL,
          includeOngoing: false,
          name: "filename"
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBeTruthy();
      expect(spy.mock.calls.length).toBe(1);
      expect(spy.mock.calls[0]).toEqual([
        {
          data: {
            target: Task.EXPORT_TARGET.ALL,
            includeOngoing: false,
            name: "filename"
          },
          projectId: 1,
          resourceId: data.tasks.task1.id,
          userId: data.users.superadminUser.id
        }
      ]);

      spy.mockRestore();
    });
    test("Should queue task export job (app admin)", async () => {
      const spy = jest.spyOn(taskExportService, "add");

      const response = await request(app)
        .post(`/api/projects/1/tasks/${data.tasks.task1.id}/export`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.appadminUser.userTokens[0].token}`])
        .send({
          target: Task.EXPORT_TARGET.NEW_AND_UPDATED,
          includeOngoing: true
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBeTruthy();
      expect(spy.mock.calls.length).toBe(1);
      expect(spy.mock.calls[0]).toEqual([
        {
          data: {
            target: Task.EXPORT_TARGET.NEW_AND_UPDATED,
            includeOngoing: true,
            name: undefined
          },
          projectId: 1,
          resourceId: data.tasks.task1.id,
          userId: data.users.appadminUser.id
        }
      ]);

      spy.mockRestore();
    });
    test("Should queue task export job (project admin)", async () => {
      const spy = jest.spyOn(taskExportService, "add");

      const response = await request(app)
        .post(`/api/projects/1/tasks/${data.tasks.task1.id}/export`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.adminUser.userTokens[0].token}`])
        .send();

      expect(response.status).toBe(200);
      expect(response.body.message).toBeTruthy();
      expect(spy.mock.calls.length).toBe(1);
      expect(spy.mock.calls[0]).toEqual([
        {
          data: {
            target: Task.EXPORT_TARGET.ALL,
            includeOngoing: true,
            name: undefined
          },
          projectId: 1,
          resourceId: data.tasks.task1.id,
          userId: data.users.adminUser.id
        }
      ]);

      spy.mockRestore();
    });

    test("Should not queue task export job (annotator)", async () => {
      const spy = jest.spyOn(taskExportService, "add");
      const response = await request(app)
        .post(`/api/projects/1/tasks/${data.tasks.task1.id}/export`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.annotatorUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(404);
      expect(response.body.message).toBeTruthy();
      expect(spy.mock.calls.length).toBe(0);
      spy.mockRestore();
    });

    test("Should not queue task export job (different admin)", async () => {
      const spy = jest.spyOn(taskExportService, "add");
      const response = await request(app)
        .post(`/api/projects/1/tasks/${data.tasks.task1.id}/export`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.differentAdminUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(404);
      expect(response.body.message).toBeTruthy();
      expect(spy.mock.calls.length).toBe(0);
      spy.mockRestore();
    });

    test("Should not queue task export job (normal)", async () => {
      const spy = jest.spyOn(taskExportService, "add");
      const response = await request(app)
        .post(`/api/projects/1/tasks/${data.tasks.task1.id}/export`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.normalUser.userTokens[0].token}`])
        .send();

      expect(response.status).toBe(404);
      expect(response.body.message).toBeTruthy();
      expect(spy.mock.calls.length).toBe(0);
      spy.mockRestore();
    });

    test("should return 401 if not authorized", async () => {
      const response = await request(app)
        .post(`/api/projects/1/tasks/${data.tasks.task1.id}/export`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=foobar`])
        .send();

      expect(response.status).toBe(401);
      expect(response.body).toEqual({});
    });
    test("should return 5xx if error happens", async () => {
      const spy = jest.spyOn(taskExportService, "add");
      spy.mockImplementationOnce(() => {
        throw new Error();
      });
      const response = await request(app)
        .post(`/api/projects/1/tasks/${data.tasks.task1.id}/export`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.adminUser.userTokens[0].token}`])
        .send();

      expect(response.status).toBe(500);
      expect(response.body.message).toBeTruthy();

      spy.mockRestore();
    });
  });

  describe("GET /:id/download/:exportTaskId", () => {
    test("Should download task results (super admin)", async () => {
      const exportTask = data.jobTasks.jobTask_taskExport3;
      const response = await request(app)
        .get(
          `/api/projects/${exportTask.projectId}/tasks/${
            exportTask.resourceId
          }/download/${exportTask.id}`
        )
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.superadminUser.userTokens[0].token}`
        ])
        .send();

      expect(datasource().getDownloadUrl.mock.calls.length).toBe(1);
      expect(response.header.location).toBe(exportTask.config.result.file);
    });
    test("Should download task results (app admin)", async () => {
      const exportTask = data.jobTasks.jobTask_taskExport3;
      const response = await request(app)
        .get(
          `/api/projects/${exportTask.projectId}/tasks/${
            exportTask.resourceId
          }/download/${exportTask.id}`
        )
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.appadminUser.userTokens[0].token}`])
        .send();

      expect(datasource().getDownloadUrl.mock.calls.length).toBe(1);
      expect(response.header.location).toBe(exportTask.config.result.file);
    });

    test("Should download task results (project admin)", async () => {
      const exportTask = data.jobTasks.jobTask_taskExport3;
      const response = await request(app)
        .get(
          `/api/projects/${exportTask.projectId}/tasks/${
            exportTask.resourceId
          }/download/${exportTask.id}`
        )
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.adminUser.userTokens[0].token}`])
        .send();

      expect(datasource().getDownloadUrl.mock.calls.length).toBe(1);
      expect(response.header.location).toBe(exportTask.config.result.file);
    });

    test("Should not download task results (annotator)", async () => {
      const exportTask = data.jobTasks.jobTask_taskExport3;
      const response = await request(app)
        .get(
          `/api/projects/${exportTask.projectId}/tasks/${
            exportTask.resourceId
          }/download/${exportTask.id}`
        )
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.annotatorUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(404);
      expect(response.header["content-type"]).toMatch("application/json");
      expect(response.body.message).toBeTruthy();
    });

    test("Should not download task results (normal)", async () => {
      const exportTask = data.jobTasks.jobTask_taskExport3;
      const response = await request(app)
        .get(
          `/api/projects/${exportTask.projectId}/tasks/${
            exportTask.resourceId
          }/download/${exportTask.id}`
        )
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.normalUser.userTokens[0].token}`])
        .send();

      expect(response.status).toBe(404);
      expect(response.header["content-type"]).toMatch("application/json");
      expect(response.body.message).toBeTruthy();
    });

    test("Should not download task results (different)", async () => {
      const exportTask = data.jobTasks.jobTask_taskExport3;
      const response = await request(app)
        .get(
          `/api/projects/${exportTask.projectId}/tasks/${
            exportTask.resourceId
          }/download/${exportTask.id}`
        )
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.differentAdminUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(404);
      expect(response.header["content-type"]).toMatch("application/json");
      expect(response.body.message).toBeTruthy();
    });

    test("Should not download task results for different task", async () => {
      const exportTask = data.jobTasks.jobTask_taskExport3;
      const exportTask2 = data.jobTasks.jobTask_taskExport4;
      const response = await request(app)
        .get(
          `/api/projects/${exportTask.projectId}/tasks/${
            exportTask.resourceId
          }/download/${exportTask2.id}`
        )
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.superadminUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(404);
      expect(response.header["content-type"]).toMatch("application/json");
      expect(response.body.message).toBeTruthy();
    });

    test("Should not download task results for not started task", async () => {
      const exportTask = data.jobTasks.jobTask_taskExport1;
      const response = await request(app)
        .get(
          `/api/projects/${exportTask.projectId}/tasks/${
            exportTask.resourceId
          }/download/${exportTask.id}`
        )
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.superadminUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(404);
      expect(response.header["content-type"]).toMatch("application/json");
      expect(response.body.message).toBeTruthy();
    });

    test("Should not download task results for ongoing task", async () => {
      const exportTask = data.jobTasks.jobTask_taskExport2;
      const response = await request(app)
        .get(
          `/api/projects/${exportTask.projectId}/tasks/${
            exportTask.resourceId
          }/download/${exportTask.id}`
        )
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.superadminUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(404);
      expect(response.header["content-type"]).toMatch("application/json");
      expect(response.body.message).toBeTruthy();
    });

    test("Should not download task results for error task", async () => {
      const exportTask = data.jobTasks.jobTask_taskExport5;
      const response = await request(app)
        .get(
          `/api/projects/${exportTask.projectId}/tasks/${
            exportTask.resourceId
          }/download/${exportTask.id}`
        )
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.superadminUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(404);
      expect(response.header["content-type"]).toMatch("application/json");
      expect(response.body.message).toBeTruthy();
    });

    test("Should not download task results for fetch task", async () => {
      const fetchTask = data.jobTasks.jobTask_taskFetch1;
      const response = await request(app)
        .get(
          `/api/projects/${fetchTask.projectId}/tasks/${
            fetchTask.resourceId
          }/download/${fetchTask.id}`
        )
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.superadminUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(404);
      expect(response.header["content-type"]).toMatch("application/json");
      expect(response.body.message).toBeTruthy();
    });

    test("should return 401 if not authorized", async () => {
      const exportTask = data.jobTasks.jobTask_taskExport3;
      const response = await request(app)
        .get(
          `/api/projects/${exportTask.projectId}/tasks/${
            exportTask.resourceId
          }/download/${exportTask.id}`
        )
        .set("Content-type", "application/json")
        .set("Cookie", [`token=foobar`])
        .send();

      expect(response.status).toBe(401);
      expect(response.body).toEqual({});
    });

    test("should return 5xx if error happens", async () => {
      const spy = jest.spyOn(JobTask, "findOne");
      spy.mockImplementationOnce(() => {
        throw new Error();
      });
      const exportTask = data.jobTasks.jobTask_taskExport3;
      const response = await request(app)
        .get(
          `/api/projects/${exportTask.projectId}/tasks/${
            exportTask.resourceId
          }/download/${exportTask.id}`
        )
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.superadminUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(500);
      expect(response.body.message).toBeTruthy();

      spy.mockRestore();
    });
  });
});
