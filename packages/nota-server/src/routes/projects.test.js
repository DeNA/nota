jest.mock("../services/notaService");

const request = require("supertest");
const app = require("../app");
const { db } = require("../lib/testUtils");
const { Project } = require("../models");

let data;

beforeAll(async () => {
  await db.resetTestDb();
  data = await db.generateTestData();
});

describe("/api/projects", () => {
  describe("GET /", () => {
    test("User without permissions should retrieve no projects", async () => {
      const response = await request(app)
        .get(`/api/projects`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.normalUser.userTokens[0].token}`])
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    test("Admin user should retrieve projects correctly", async () => {
      const response = await request(app)
        .get(`/api/projects`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.adminUser.userTokens[0].token}`])
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        {
          id: 1,
          name: "project_1",
          status: 1
        },
        {
          id: 2,
          name: "project_2",
          status: 1
        }
      ]);
    });
    test("Superadmin user should retrieve projects correctly", async () => {
      const response = await request(app)
        .get(`/api/projects`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.superadminUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        {
          id: 1,
          name: "project_1",
          status: 1
        },
        {
          id: 2,
          name: "project_2",
          status: 1
        },
        {
          id: 3,
          name: "project_3",
          status: 1
        },
        {
          id: 4,
          name: "project_4",
          status: 0
        }
      ]);
    });
    test("should return 401 if not authorized", async () => {
      const response = await request(app)
        .get(`/api/projects`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=foobar`])
        .send();

      expect(response.status).toBe(401);
      expect(response.body).toEqual({});
    });
    test("should return 5xx if error happens", async () => {
      const spy = jest.spyOn(Project, "findAll");
      spy.mockImplementationOnce(() => {
        throw new Error();
      });
      const response = await request(app)
        .get(`/api/projects`)
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
    test("Superadmin should retrieve project correctly", async () => {
      const response = await request(app)
        .get(`/api/projects/1`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.superadminUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: 1,
        name: "project_1",
        groups: [
          { name: "admin_group", type: 200 },
          { name: "annotator_group", type: 100 }
        ],
        status: 1,
        createdBy: { id: 1, username: "admin" },
        updatedBy: { id: 1, username: "admin" }
      });
      expect(response.body.createdAt).toBeTruthy();
      expect(response.body.updatedAt).toBeTruthy();
    });
    test("User with project permissions should retrieve project correctly", async () => {
      const response = await request(app)
        .get(`/api/projects/1`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.annotatorUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: 1,
        name: "project_1",
        groups: [
          { name: "admin_group", type: 200 },
          { name: "annotator_group", type: 100 }
        ],
        status: 1,
        createdBy: { id: 1, username: "admin" },
        updatedBy: { id: 1, username: "admin" }
      });
      expect(response.body.createdAt).toBeTruthy();
      expect(response.body.updatedAt).toBeTruthy();
    });
    test("should return 404 when project doesnt exist", async () => {
      const response = await request(app)
        .get(`/api/projects/foo`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.annotatorUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Not Found" });
    });
    test("should return 404 when user has no permission to view projects", async () => {
      const response = await request(app)
        .get(`/api/projects/3`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.annotatorUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Not Found" });
    });
    test("should return 404 when user project is not ready", async () => {
      const response = await request(app)
        .get(`/api/projects/4`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.annotatorUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Not Found" });
    });
    test("should return 404 when user project is deleted", async () => {
      const response = await request(app)
        .get(`/api/projects/5`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.annotatorUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Not Found" });
    });
    test("should return 5xx if error happens", async () => {
      const spy = jest.spyOn(Project, "findByPk");
      spy.mockImplementationOnce(() => {
        throw new Error();
      });
      const response = await request(app)
        .get(`/api/projects/1`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.superadminUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(500);
      expect(response.body.message).toBeTruthy();

      spy.mockRestore();
    });
    test("should return 401 if not authorized", async () => {
      const response = await request(app)
        .get(`/api/projects/1`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=foobar`])
        .send();

      expect(response.status).toBe(401);
      expect(response.body).toEqual({});
    });
  });

  describe("GET /available", () => {
    test("User should retrieve available tasks correctly", async () => {
      const response = await request(app)
        .get(`/api/projects/available`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.annotatorUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toMatchObject({
        id: 1,
        name: "project_1",
        tasks: [
          {
            assignable: 2,
            assignments: [
              {
                annotator: { id: 3, username: "annotator_user" },
                done: 0,
                id: 2,
                status: 100,
                total: 2
              },
              {
                annotator: { id: 3, username: "annotator_user" },
                done: 2,
                id: 1,
                status: 500,
                total: 2
              }
            ],
            description: "description",
            done: 2,
            id: 1,
            name: "task_1",
            status: 100,
            total: 6
          },
          {
            assignable: 0,
            assignments: [],
            description: "description",
            done: 0,
            id: 2,
            name: "task_2",
            status: 100,
            total: 0
          }
        ]
      });
    });
    test("Admin should retrieve available tasks correctly (including hidden)", async () => {
      const response = await request(app)
        .get(`/api/projects/available`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.adminUser.userTokens[0].token}`])
        .send();

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toMatchObject({
        id: 1,
        name: "project_1"
      });
      expect(response.body[0].tasks.length).toBe(3);
      expect(response.body[0].tasks[0].id).toBe(data.tasks.task1.id);
      expect(response.body[0].tasks[1].id).toBe(data.tasks.task2.id);
      expect(response.body[0].tasks[2].id).toBe(data.tasks.task4.id);
    });
    test("should return 5xx if error happens", async () => {
      const spy = jest.spyOn(Project, "findAll");
      spy.mockImplementationOnce(() => {
        throw new Error();
      });
      const response = await request(app)
        .get(`/api/projects/available`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.superadminUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(500);
      expect(response.body.message).toBeTruthy();

      spy.mockRestore();
    });
    test("should return 401 if not authorized", async () => {
      const response = await request(app)
        .get(`/api/projects/available`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=foobar`])
        .send();

      expect(response.status).toBe(401);
      expect(response.body).toEqual({});
    });
  });

  describe("POST /", () => {
    let newProject;

    beforeAll(async () => {
      newProject = {
        name: "new_project_foo"
      };
    });
    afterAll(async () => {
      await db.resetTestDb();
      data = await db.generateTestData();
    });

    test("Should create project (app admin)", async () => {
      const response = await request(app)
        .post(`/api/projects`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.appadminUser.userTokens[0].token}`])
        .send(newProject);

      const project = await Project.findByPk(response.body.id, { raw: true });
      expect(project).toMatchObject({
        id: response.body.id,
        name: newProject.name,
        status: Project.STATUS.READY,
        createdBy: data.users.appadminUser.id
      });
    });

    test("Should not create project (super admin)", async () => {
      const response = await request(app)
        .post(`/api/projects`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.superadminUser.userTokens[0].token}`
        ])
        .send(newProject);

      expect(response.status).toBe(401);
      expect(response.body.message).toBeTruthy();
    });
    test("Should not create project (project admin)", async () => {
      const response = await request(app)
        .post(`/api/projects`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.adminUser.userTokens[0].token}`])
        .send(newProject);

      expect(response.status).toBe(401);
      expect(response.body.message).toBeTruthy();
    });
    test("Should not create project (annotator)", async () => {
      const response = await request(app)
        .post(`/api/projects`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.annotatorUser.userTokens[0].token}`
        ])
        .send(newProject);

      expect(response.status).toBe(401);
      expect(response.body.message).toBeTruthy();
    });
    test("Should not create project (normal)", async () => {
      const response = await request(app)
        .post(`/api/projects`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.normalUser.userTokens[0].token}`])
        .send(newProject);

      expect(response.status).toBe(401);
      expect(response.body.message).toBeTruthy();
    });
    test("should return 401 if not authorized", async () => {
      const response = await request(app)
        .post(`/api/projects`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=foobar`])
        .send(newProject);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({});
    });
    test("should return 5xx if error happens", async () => {
      const spy = jest.spyOn(Project, "create");
      spy.mockImplementationOnce(() => {
        throw new Error();
      });
      const response = await request(app)
        .post(`/api/projects`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.appadminUser.userTokens[0].token}`])
        .send(newProject);

      expect(response.status).toBe(500);
      expect(response.body.message).toBeTruthy();

      spy.mockRestore();
    });
  });

  describe("PUT /:id", () => {
    beforeEach(async () => {
      await db.resetTestDb();
      data = await db.generateTestData();
    });
    test("Admin should be able to update project name", async () => {
      const response = await request(app)
        .put(`/api/projects/1`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.superadminUser.userTokens[0].token}`
        ])
        .send({ name: "new_name" });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: 1,
        name: "new_name",
        groups: [
          { name: "admin_group", type: 200 },
          { name: "annotator_group", type: 100 }
        ],
        status: Project.STATUS.READY,
        createdBy: { id: 1, username: "admin" },
        updatedBy: { id: 5, username: "superadmin_user" }
      });
    });
    test("Admin should be able to update project status", async () => {
      const response = await request(app)
        .put(`/api/projects/1`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.superadminUser.userTokens[0].token}`
        ])
        .send({ status: Project.STATUS.NOT_READY });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: 1,
        name: "project_1",
        groups: [
          { name: "admin_group", type: 200 },
          { name: "annotator_group", type: 100 }
        ],
        status: Project.STATUS.NOT_READY,
        createdBy: { id: 1, username: "admin" },
        updatedBy: { id: 5, username: "superadmin_user" }
      });
    });
    test("Admin should be able to update project groups", async () => {
      const response = await request(app)
        .put(`/api/projects/1`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.superadminUser.userTokens[0].token}`
        ])
        .send({
          groups: [
            { name: "admin_group_2", type: 200 },
            { name: "annotator_group", type: 100 },
            { name: "annotator_group_2", type: 100 }
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: 1,
        name: "project_1",
        groups: [
          { name: "admin_group_2", type: 200 },
          { name: "annotator_group", type: 100 },
          { name: "annotator_group_2", type: 100 }
        ],
        status: Project.STATUS.READY,
        createdBy: { id: 1, username: "admin" },
        updatedBy: { id: 5, username: "superadmin_user" }
      });
    });
    test("Admin should be able to update project status and groups", async () => {
      const response = await request(app)
        .put(`/api/projects/1`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.superadminUser.userTokens[0].token}`
        ])
        .send({
          status: Project.STATUS.NOT_READY,
          groups: [
            { name: "admin_group_2", type: 200 },
            { name: "annotator_group", type: 100 },
            { name: "annotator_group_2", type: 100 }
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: 1,
        name: "project_1",
        groups: [
          { name: "admin_group_2", type: 200 },
          { name: "annotator_group", type: 100 },
          { name: "annotator_group_2", type: 100 }
        ],
        status: Project.STATUS.NOT_READY,
        createdBy: { id: 1, username: "admin" },
        updatedBy: { id: 5, username: "superadmin_user" }
      });
    });
    test("should return 5xx if error happens", async () => {
      const spy = jest.spyOn(Project.prototype, "update");
      spy.mockImplementationOnce(() => {
        throw new Error();
      });
      const response = await request(app)
        .put(`/api/projects/1`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.superadminUser.userTokens[0].token}`
        ])
        .send({ status: Project.STATUS.NOT_READY, groups: [] });

      expect(response.status).toBe(500);
      console.error(response.body);
      expect(response.body.message).toBeTruthy();

      spy.mockRestore();
    });
    test("should return 401 if not authorized", async () => {
      const response = await request(app)
        .put(`/api/projects/1`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=foobar`])
        .send({ status: Project.STATUS.NOT_READY });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({});
    });
    test("should return 404 if not project admin (normal user)", async () => {
      const response = await request(app)
        .put(`/api/projects/1`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.normalUser.userTokens[0].token}`])
        .send({ status: Project.STATUS.NOT_READY });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Not Found" });
    });

    test("should return 404 if not project admin (annotator user)", async () => {
      const response = await request(app)
        .put(`/api/projects/1`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.annotatorUser.userTokens[0].token}`
        ])
        .send({ status: Project.STATUS.NOT_READY });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Not Found" });
    });
  });

  describe("GET /:id/assignableUsers", () => {
    test("Should retrieve assignable users (appadmin)", async () => {
      const response = await request(app)
        .get(`/api/projects/1/assignableUsers`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.appadminUser.userTokens[0].token}`])
        .send();

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(5);
      expect(response.body[0]).toMatchObject({
        id: 3,
        permission: 0,
        username: "annotator_user"
      });
      expect(response.body[1]).toMatchObject({
        id: 4,
        permission: 10,
        username: "admin_user"
      });
      expect(response.body[2]).toMatchObject({
        id: 1,
        permission: 30,
        username: "admin"
      });
      expect(response.body[3]).toMatchObject({
        id: 5,
        permission: 20,
        username: "superadmin_user"
      });
      expect(response.body[4]).toMatchObject({
        id: 6,
        permission: 30,
        username: "appadmin_user"
      });
    });
    test("Should retrieve assignable users (superadmin)", async () => {
      const response = await request(app)
        .get(`/api/projects/1/assignableUsers`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.superadminUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(5);
      expect(response.body[0]).toMatchObject({
        id: 3,
        permission: 0,
        username: "annotator_user"
      });
      expect(response.body[1]).toMatchObject({
        id: 4,
        permission: 10,
        username: "admin_user"
      });
      expect(response.body[2]).toMatchObject({
        id: 1,
        permission: 30,
        username: "admin"
      });
      expect(response.body[3]).toMatchObject({
        id: 5,
        permission: 20,
        username: "superadmin_user"
      });
      expect(response.body[4]).toMatchObject({
        id: 6,
        permission: 30,
        username: "appadmin_user"
      });
    });
    test("Should retrieve assignable users (project admin)", async () => {
      const response = await request(app)
        .get(`/api/projects/1/assignableUsers`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.adminUser.userTokens[0].token}`])
        .send();

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(5);
      expect(response.body[0]).toMatchObject({
        id: 3,
        permission: 0,
        username: "annotator_user"
      });
      expect(response.body[1]).toMatchObject({
        id: 4,
        permission: 10,
        username: "admin_user"
      });
      expect(response.body[2]).toMatchObject({
        id: 1,
        permission: 30,
        username: "admin"
      });
      expect(response.body[3]).toMatchObject({
        id: 5,
        permission: 20,
        username: "superadmin_user"
      });
      expect(response.body[4]).toMatchObject({
        id: 6,
        permission: 30,
        username: "appadmin_user"
      });
    });

    test("should return 404 when project doesnt exist", async () => {
      const response = await request(app)
        .get(`/api/projects/foo/assignableUsers`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.annotatorUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Not Found" });
    });
    test("should return 404 when user has no permission to view projects (different pj admin)", async () => {
      const response = await request(app)
        .get(`/api/projects/1/assignableUsers`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.differentAdminUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Not Found" });
    });
    test("should return 404 when user has no permission to view projects (annotator)", async () => {
      const response = await request(app)
        .get(`/api/projects/1/assignableUsers`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.annotatorUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Not Found" });
    });
    test("should return 404 when user has no permission to view projects (normal)", async () => {
      const response = await request(app)
        .get(`/api/projects/1/assignableUsers`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.normalUser.userTokens[0].token}`])
        .send();

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Not Found" });
    });
    test("should return 5xx if error happens", async () => {
      const spy = jest.spyOn(Project.prototype, "getAssignableUsers");
      spy.mockImplementationOnce(() => {
        throw new Error();
      });
      const response = await request(app)
        .get(`/api/projects/1/assignableUsers`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.superadminUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(500);
      expect(response.body.message).toBeTruthy();

      spy.mockRestore();
    });
    test("should return 401 if not authorized", async () => {
      const response = await request(app)
        .get(`/api/projects/1/assignableUsers`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=foobar`])
        .send();

      expect(response.status).toBe(401);
      expect(response.body).toEqual({});
    });
  });
});
