jest.mock("../services/notaService");

const request = require("supertest");
const app = require("../app");
const { db } = require("../lib/testUtils");
const { TaskTemplate } = require("../models");

let data;

beforeAll(async () => {
  data = await db.resetTestDb();
});

describe("/api/projects/:projectId/templates", () => {
  describe("GET /", () => {
    test("should receive templates (project admin)", async () => {
      const response = await request(app)
        .get(`/api/projects/${data.projects.project1.id}/taskTemplates`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.adminUser.userTokens[0].token}`])
        .send();

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(3);
      expect(response.body[0]).toMatchObject({
        id: data.taskTemplates.template1.id,
        name: data.taskTemplates.template1.name,
        description: data.taskTemplates.template1.description,
        projectId: data.taskTemplates.template1.projectId
      });
      expect(response.body[1]).toMatchObject({
        id: data.taskTemplates.template2.id,
        name: data.taskTemplates.template2.name,
        description: data.taskTemplates.template2.description,
        projectId: data.taskTemplates.template2.projectId
      });
      expect(response.body[2]).toMatchObject({
        id: data.taskTemplates.template3.id,
        name: data.taskTemplates.template3.name,
        description: data.taskTemplates.template3.description,
        projectId: data.taskTemplates.template3.projectId
      });
      expect(response.body[0].template).toBeUndefined();
      expect(response.body[1].template).toBeUndefined();
      expect(response.body[2].template).toBeUndefined();
    });
    test("should receive templates (super admin)", async () => {
      const response = await request(app)
        .get(`/api/projects/${data.projects.project1.id}/taskTemplates`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.superadminUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(3);
    });
    test("should receive templates (app admin)", async () => {
      const response = await request(app)
        .get(`/api/projects/${data.projects.project1.id}/taskTemplates`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.appadminUser.userTokens[0].token}`])
        .send();

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(3);
    });
    test("should not receive templates (annotator)", async () => {
      const response = await request(app)
        .get(`/api/projects/${data.projects.project1.id}/taskTemplates`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.annotatorUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(404);
      expect(response.body.message).toBeTruthy();
    });
    test("should not receive templates (normal)", async () => {
      const response = await request(app)
        .get(`/api/projects/${data.projects.project1.id}/taskTemplates`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.normalUser.userTokens[0].token}`])
        .send();

      expect(response.status).toBe(404);
      expect(response.body.message).toBeTruthy();
    });
    test("should not receive templates (different)", async () => {
      const response = await request(app)
        .get(`/api/projects/${data.projects.project1.id}/taskTemplates`)
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.differentAdminUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(404);
      expect(response.body.message).toBeTruthy();
    });

    test("should return 401 if not authorized", async () => {
      const response = await request(app)
        .get(`/api/projects/1/taskTemplates`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=foobar`])
        .send();

      expect(response.status).toBe(401);
      expect(response.body).toEqual({});
    });
    test("should return 5xx if error happens", async () => {
      const spy = jest.spyOn(TaskTemplate, "findAll");
      spy.mockImplementationOnce(() => {
        throw new Error();
      });
      const response = await request(app)
        .get(`/api/projects/1/taskTemplates`)
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
    test("should receive template (project admin)", async () => {
      const response = await request(app)
        .get(
          `/api/projects/${data.projects.project1.id}/taskTemplates/${
            data.taskTemplates.template1.id
          }`
        )
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.adminUser.userTokens[0].token}`])
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: data.taskTemplates.template1.id,
        name: data.taskTemplates.template1.name,
        description: data.taskTemplates.template1.description,
        projectId: data.taskTemplates.template1.projectId,
        template: { parser: "jsonv2", foo: "bar" },
        createdBy: {
          id: 1,
          username: "admin"
        },
        updatedBy: {
          id: 1,
          username: "admin"
        }
      });
    });
    test("should receive templates (super admin)", async () => {
      const response = await request(app)
        .get(
          `/api/projects/${data.projects.project1.id}/taskTemplates/${
            data.taskTemplates.template1.id
          }`
        )
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.superadminUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(data.taskTemplates.template1.id);
    });
    test("should receive templates (app admin)", async () => {
      const response = await request(app)
        .get(
          `/api/projects/${data.projects.project1.id}/taskTemplates/${
            data.taskTemplates.template1.id
          }`
        )
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.appadminUser.userTokens[0].token}`])
        .send();

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(data.taskTemplates.template1.id);
    });
    test("should not receive templates (annotator)", async () => {
      const response = await request(app)
        .get(
          `/api/projects/${data.projects.project1.id}/taskTemplates/${
            data.taskTemplates.template1.id
          }`
        )
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.annotatorUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(404);
      expect(response.body.message).toBeTruthy();
    });
    test("should not receive templates (normal)", async () => {
      const response = await request(app)
        .get(
          `/api/projects/${data.projects.project1.id}/taskTemplates/${
            data.taskTemplates.template1.id
          }`
        )
        .set("Content-type", "application/json")
        .set("Cookie", [`token=${data.users.normalUser.userTokens[0].token}`])
        .send();

      expect(response.status).toBe(404);
      expect(response.body.message).toBeTruthy();
    });
    test("should not receive templates (different)", async () => {
      const response = await request(app)
        .get(
          `/api/projects/${data.projects.project1.id}/taskTemplates/${
            data.taskTemplates.template1.id
          }`
        )
        .set("Content-type", "application/json")
        .set("Cookie", [
          `token=${data.users.differentAdminUser.userTokens[0].token}`
        ])
        .send();

      expect(response.status).toBe(404);
      expect(response.body.message).toBeTruthy();
    });

    test("should return 401 if not authorized", async () => {
      const response = await request(app)
        .get(`/api/projects/1/taskTemplates/${data.taskTemplates.template1.id}`)
        .set("Content-type", "application/json")
        .set("Cookie", [`token=foobar`])
        .send();

      expect(response.status).toBe(401);
      expect(response.body).toEqual({});
    });
    test("should return 5xx if error happens", async () => {
      const spy = jest.spyOn(TaskTemplate, "findByPk");
      spy.mockImplementationOnce(() => {
        throw new Error();
      });
      const response = await request(app)
        .get(`/api/projects/1/taskTemplates/${data.taskTemplates.template1.id}`)
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
