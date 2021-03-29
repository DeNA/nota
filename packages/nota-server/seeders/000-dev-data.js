"use strict";
const image_template = require("../testfiles/image_template.json");
const video_template = require("../testfiles/video_template.json");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "users",
      [
        {
          id: 2,
          username: "user_1",
          email: "user_1@nota",
          password:
            "$2a$10$4t9WDGV3GN2NooeKz2LeO.vPMAeh548yHZl4.iHHvJLvNsxCm8SFS",
          status: 1,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        },
        {
          id: 3,
          username: "user_2",
          email: "user_2@nota",
          password:
            "$2a$10$4t9WDGV3GN2NooeKz2LeO.vPMAeh548yHZl4.iHHvJLvNsxCm8SFS",
          status: 1,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        },
        {
          id: 4,
          username: "user_3",
          email: "user_3@nota",
          password:
            "$2a$10$4t9WDGV3GN2NooeKz2LeO.vPMAeh548yHZl4.iHHvJLvNsxCm8SFS",
          status: 1,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        },
        {
          id: 5,
          username: "deleted_user_1",
          email: "deleted_user_1@nota",
          password:
            "$2a$10$4t9WDGV3GN2NooeKz2LeO.vPMAeh548yHZl4.iHHvJLvNsxCm8SFS",
          status: 0,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        }
      ],
      {}
    );
    await queryInterface.bulkInsert(
      "user_groups",
      [
        {
          user_id: 2,
          name: "annotator_group",
          created_at: new Date(),
          created_by: 1
        },
        {
          user_id: 4,
          name: "admin_group",
          created_at: new Date(),
          created_by: 1
        }
      ],
      {}
    );
    await queryInterface.bulkInsert(
      "projects",
      [
        {
          id: 1,
          name: "project_1",
          status: 1,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        },
        {
          id: 2,
          name: "project_2",
          status: 1,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        },
        {
          id: 3,
          name: "not_ready_project",
          status: 0,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        },
        {
          id: 4,
          name: "deleted_project",
          status: 100,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        }
      ],
      {}
    );
    await queryInterface.bulkInsert(
      "project_groups",
      [
        {
          project_id: 1,
          name: "annotator_group",
          type: 100,
          created_at: new Date(),
          created_by: 1
        },
        {
          project_id: 1,
          name: "admin_group",
          type: 200,
          created_at: new Date(),
          created_by: 1
        }
      ],
      {}
    );
    await queryInterface.bulkInsert(
      "task_templates",
      [
        {
          id: 1,
          name: "image_template_1",
          description: "example image template",
          project_id: 1,
          template: JSON.stringify(image_template),
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        },
        {
          id: 2,
          name: "video_template_1",
          description: "example video template",
          project_id: 1,
          template: JSON.stringify(video_template),
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        }
      ],
      {}
    );
    await queryInterface.bulkInsert(
      "media_sources",
      [
        {
          id: 1,
          name: "testfiles",
          description: "sample image and videos for dev",
          project_id: 1,
          datasource: "file",
          status: 100, // ready
          config: JSON.stringify({
            extensions: ["jpg", "png", "mp4"],
            path: process.cwd() + "/testfiles",
            filters: [
              { name: "stringFilter", label: "string Filter", type: 1 },
              { name: "integerFilter", label: "integer Filter", type: 2 },
              { name: "datetimeFilter", label: "datetime Filter", type: 3 },
              {
                name: "nested.stringFilter",
                label: "n string Filter",
                type: 1
              },
              {
                name: "nested.integerFilter",
                label: "n integer Filter",
                type: 2
              },
              {
                name: "nested.datetimeFilter",
                label: "n datetime Filter",
                type: 3
              },
              {
                name: "nested.nested.stringFilter",
                label: "nn string Filter",
                type: 1
              },
              {
                name: "nested.nested.integerFilter",
                label: "nn integer Filter",
                type: 2
              },
              {
                name: "nested.nested.datetimeFilter",
                label: "nn datetime Filter",
                type: 3
              }
            ]
          }),
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        }
      ],
      {}
    );
    await queryInterface.bulkInsert(
      "tasks",
      [
        {
          id: 1,
          name: "image_task_1",
          description: "sample image task",
          project_id: 1,
          task_template_id: 1,
          media_source_id: 1,
          media_source_config: `{"options":{"path": "images"}}`,
          status: 100,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        },
        {
          id: 2,
          name: "video_task_1",
          description: "sample video task",
          project_id: 1,
          task_template_id: 2,
          media_source_id: 1,
          media_source_config: `{"options":{"path": "videos"}}`,
          status: 200,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        }
      ],
      {}
    );
    await queryInterface.bulkInsert(
      "task_assignments",
      [
        {
          id: 1,
          task_id: 1,
          status: 100,
          annotator: 2,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        },
        {
          id: 2,
          task_id: 1,
          status: 500,
          annotator: 1,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        }
      ],
      {}
    );

    await queryInterface.bulkInsert(
      "media_items",
      [
        //testfiles/images
        {
          id: 1,
          media_source_id: 1,
          name: "image_1.jpg",
          path: "images",
          metadata: JSON.stringify({
            fileName: "image_1.jpg",
            externalMetadata: { foo: "bar" }
          }),
          status: 1,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        },
        {
          id: 2,
          media_source_id: 1,
          name: "image_2.jpg",
          path: "images",
          metadata: JSON.stringify({
            fileName: "image_2.jpg"
          }),
          status: 1,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        },
        {
          id: 3,
          media_source_id: 1,
          name: "image_3.jpg",
          path: "images",
          metadata: JSON.stringify({
            fileName: "image_3.jpg"
          }),
          status: 0,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        },
        {
          id: 4,
          media_source_id: 1,
          name: "image_4.jpg",
          path: "images",
          metadata: JSON.stringify({
            fileName: "image_4.jpg"
          }),
          status: 1,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        },
        // testfiles/videos
        {
          id: 2001,
          media_source_id: 1,
          name: "video_1.mp4",
          path: "videos",
          metadata: JSON.stringify({
            fileName: "video_1.mp4"
          }),
          status: 1,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        },
        {
          id: 2002,
          media_source_id: 1,
          name: "video_2.mp4",
          path: "videos",
          metadata: JSON.stringify({
            fileName: "video_2.mp4"
          }),
          status: 1,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        }
      ],
      {}
    );

    await queryInterface.bulkInsert(
      "media_item_tags",
      [
        {
          media_item_id: 1,
          name: "stringFilter",
          type: 1,
          value_string: "foo",
          value_integer: null,
          value_datetime: null
        },
        {
          media_item_id: 1,
          name: "integerFilter",
          type: 2,
          value_string: null,
          value_integer: 100,
          value_datetime: null
        },
        {
          media_item_id: 1,
          name: "datetimeFilter",
          type: 3,
          value_string: null,
          value_integer: null,
          value_datetime: new Date("2018/01/01 00:00:00")
        },
        {
          media_item_id: 2,
          name: "stringFilter",
          type: 1,
          value_string: "bar",
          value_integer: null,
          value_datetime: null
        },
        {
          media_item_id: 2,
          name: "integerFilter",
          type: 2,
          value_string: null,
          value_integer: 100,
          value_datetime: null
        },
        {
          media_item_id: 2,
          name: "datetimeFilter",
          type: 3,
          value_string: null,
          value_integer: null,
          value_datetime: new Date("2018/01/01 00:00:00")
        },
        {
          media_item_id: 3,
          name: "stringFilter",
          type: 1,
          value_string: "foo",
          value_integer: null,
          value_datetime: null
        },
        {
          media_item_id: 3,
          name: "integerFilter",
          type: 2,
          value_string: null,
          value_integer: 200,
          value_datetime: null
        },
        {
          media_item_id: 3,
          name: "datetimeFilter",
          type: 3,
          value_string: null,
          value_integer: null,
          value_datetime: new Date("2018/01/02 00:00:00")
        }
      ],
      {}
    );

    await queryInterface.bulkInsert(
      "task_items",
      [
        {
          id: 1,
          media_item_id: 1,
          task_id: 1,
          task_assignment_id: 1,
          status: 0,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        },
        {
          id: 2,
          media_item_id: 2,
          task_id: 1,
          task_assignment_id: 1,
          status: 0,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        },
        {
          id: 3,
          media_item_id: 3,
          task_id: 1,
          task_assignment_id: null,
          status: 0,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        },
        {
          id: 4,
          media_item_id: 4,
          task_id: 1,
          task_assignment_id: null,
          status: 0,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        },
        {
          id: 2001,
          media_item_id: 2001,
          task_id: 2,
          task_assignment_id: null,
          status: 0,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        },
        {
          id: 2002,
          media_item_id: 2002,
          task_id: 2,
          task_assignment_id: null,
          status: 0,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1
        }
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("task_items", null, {});
    await queryInterface.bulkDelete("task_assignments", null, {});
    await queryInterface.bulkDelete("tasks", null, {});
    await queryInterface.bulkDelete("task_templates", null, {});
    await queryInterface.bulkDelete("media_item_tags", null, {});
    await queryInterface.bulkDelete("media_items", null, {});
    await queryInterface.bulkDelete("media_sources", null, {});
    await queryInterface.bulkDelete("project_groups", null, {});
    await queryInterface.bulkDelete("projects", null, {});
    await queryInterface.bulkDelete("user_groups", null, {});
    await queryInterface.bulkDelete("user_tokens", null, {});
    await queryInterface.bulkDelete("users", null, {});
  }
};
