const AWS = require("aws-sdk-mock");
const { db } = require("../lib/testUtils");
const mediaSourceFetch = require("./mediaSourceFetch");
const { MediaSource, MediaItemTag } = require("../models");
const { Op } = require("sequelize");
const { Readable } = require("stream");
const fsmock = require("mock-fs");

let mediaSource;
let data;
const files = {
  "/a/b/c/1.jpg": "binary",
  "/a/b/c/1.jpg.meta.json": `{"filter_string":"bar","filter_integer":1111,"filter_date":"2020-01-01","foo":"bar","nested":{"deep":{"filter_string":"nested_bar"}}}`,
  "/a/b/c/2.jpg": "binary",
  "/a/b/1.mp4": "binary",
  "/a/b/2.mp4": "binary",
  "/a/b/3.jpg": "binary",
  "/a/b/4.jpg": "binary",
  "/a/1.jpg": "binary",
  "/a/1.jpg.json": `{"annotations":[{"type":"typeA","labels":{"foo":"bar"},"boundaries":{"type":"RECTANGLE","top":10,"bottom":10,"left":10,"right":10}}]}`,
  "/a/1.jpg.meta.json": `{"filter_string": "foo", "filter_integer": "not_an_integer","filter_date":"not_a_date","fizz":"buzz","nested":{}}`
};

const createMediaSource = async function({
  path = "",
  name = `media_source_${Math.random()}`,
  datasource = "file"
} = {}) {
  const newMediaSource = await db.createMediaSource({
    name,
    description: "media_source test description",
    projectId: data.projects.project1.id,
    status: MediaSource.STATUS.READY,
    datasource,
    config: {
      extensions: ["jpg"],
      bucket: "dummy-bucket",
      path,
      exportPath: "output",
      filters: [
        { name: "filter_string", label: "String", type: 1 },
        { name: "nested.deep.filter_string", label: "String Nested", type: 1 },
        { name: "filter_integer", label: "Integer", type: 2 },
        { name: "filter_date", label: "Date", type: 3 },
        { name: "filter_undefined", label: "Check undefined", type: 1 }
      ]
    }
  });

  return await MediaSource.findByPk(newMediaSource.id);
};

describe("mediaSourceFetch", () => {
  describe("file datasource", () => {
    beforeAll(async () => {
      data = await db.resetTestDb();
      mediaSource = await createMediaSource();
      fsmock(files, { createCwd: false, createTmp: false });
    });
    afterAll(() => {
      fsmock.restore();
    });

    test("run correctly first time", async () => {
      const mediaItemsBefore = await mediaSource.getMediaItems();

      expect(mediaItemsBefore).toEqual([]);

      const jobTask = {
        resourceId: mediaSource.id,
        config: {
          data: {
            refresh: false
          }
        },
        createdBy: 1
      };

      const result = await mediaSourceFetch(jobTask);
      expect(result).toEqual({ added: 5 });

      const mediaItemsAfter = await mediaSource.getMediaItems();
      expect(mediaItemsAfter).toMatchObject([
        {
          createdBy: 1,
          mediaSourceId: mediaSource.id,
          metadata: {
            externalMetadata: {
              filter_date: "not_a_date",
              filter_integer: "not_an_integer",
              filter_string: "foo",
              fizz: "buzz",
              nested: {}
            },
            fileName: "1.jpg",
            importPathId: mediaSource.id,
            name: "1.jpg",
            resource: "a"
          },
          name: "1.jpg",
          path: "a",
          status: 1
        },
        {
          createdBy: 1,
          mediaSourceId: mediaSource.id,
          metadata: {
            externalMetadata: {
              filter_date: "2020-01-01",
              filter_integer: 1111,
              filter_string: "bar",
              foo: "bar",
              nested: {
                deep: {
                  filter_string: "nested_bar"
                }
              }
            },
            fileName: "1.jpg",
            importPathId: mediaSource.id,
            name: "1.jpg",
            resource: "a/b/c"
          },
          name: "1.jpg",
          path: "a/b/c",
          status: 1
        },
        {
          createdBy: 1,
          mediaSourceId: mediaSource.id,
          metadata: {
            fileName: "2.jpg",
            importPathId: mediaSource.id,
            name: "2.jpg",
            resource: "a/b/c"
          },
          name: "2.jpg",
          path: "a/b/c",
          status: 1
        },
        {
          createdBy: 1,
          mediaSourceId: mediaSource.id,
          metadata: {
            fileName: "3.jpg",
            importPathId: mediaSource.id,
            name: "3.jpg",
            resource: "a/b"
          },
          name: "3.jpg",
          path: "a/b",
          status: 1
        },
        {
          createdBy: 1,
          mediaSourceId: mediaSource.id,
          metadata: {
            fileName: "4.jpg",
            importPathId: mediaSource.id,
            name: "4.jpg",
            resource: "a/b"
          },
          name: "4.jpg",
          path: "a/b",
          status: 1
        }
      ]);

      const mediaItemTags = await MediaItemTag.findAll({
        where: {
          mediaItemId: {
            [Op.in]: mediaItemsAfter.map(mediaItem => mediaItem.id)
          }
        },
        raw: true
      });

      expect(mediaItemTags).toMatchObject([
        {
          mediaItemId: 7,
          name: "filter_string",
          type: 1,
          valueDatetime: null,
          valueInteger: null,
          valueString: "foo"
        },
        {
          mediaItemId: 10,
          name: "filter_date",
          type: 3,
          valueDatetime: "2020-01-01 00:00:00.000 +00:00",
          valueInteger: null,
          valueString: null
        },
        {
          mediaItemId: 10,
          name: "filter_integer",
          type: 2,
          valueDatetime: null,
          valueInteger: 1111,
          valueString: null
        },
        {
          mediaItemId: 10,
          name: "filter_string",
          type: 1,
          valueDatetime: null,
          valueInteger: null,
          valueString: "bar"
        },
        {
          mediaItemId: 10,
          name: "nested.deep.filter_string",
          type: 1,
          valueDatetime: null,
          valueInteger: null,
          valueString: "nested_bar"
        }
      ]);
    });

    test("run correctly refresh", async () => {
      // Add extra media items
      fsmock(
        {
          ...files,
          "/a/2.jpg": "binary",
          "/a/2.jpg.meta.json": `{"filter_string":"aaaa"}`
        },
        { createCwd: false, createTmp: false }
      );

      const jobTask = {
        resourceId: mediaSource.id,
        config: {
          data: {
            refresh: true
          }
        },
        createdBy: 1
      };

      const result = await mediaSourceFetch(jobTask);
      expect(result).toEqual({ added: 1 });

      const mediaItemsAfter = await mediaSource.getMediaItems();
      expect(mediaItemsAfter).toMatchObject([
        {
          name: "1.jpg",
          path: "a"
        },
        {
          name: "1.jpg",
          path: "a/b/c"
        },
        {
          createdBy: 1,
          mediaSourceId: mediaSource.id,
          metadata: {
            externalMetadata: {
              filter_string: "aaaa"
            },
            fileName: "2.jpg",
            importPathId: mediaSource.id,
            name: "2.jpg",
            resource: "a"
          },
          name: "2.jpg",
          path: "a",
          status: 1
        },
        {
          name: "2.jpg",
          path: "a/b/c"
        },
        {
          name: "3.jpg",
          path: "a/b"
        },
        {
          name: "4.jpg",
          path: "a/b"
        }
      ]);

      const mediaItemTags = await MediaItemTag.findAll({
        where: {
          mediaItemId: {
            [Op.in]: mediaItemsAfter.map(mediaItem => mediaItem.id)
          }
        },
        raw: true
      });

      expect(mediaItemTags).toMatchObject([
        {
          mediaItemId: 7,
          name: "filter_string"
        },
        {
          mediaItemId: 10,
          name: "filter_date"
        },
        {
          mediaItemId: 10,
          name: "filter_integer"
        },
        {
          mediaItemId: 10,
          name: "filter_string"
        },
        {
          mediaItemId: 10,
          name: "nested.deep.filter_string"
        },
        {
          mediaItemId: 12,
          name: "filter_string",
          type: 1,
          valueDatetime: null,
          valueInteger: null,
          valueString: "aaaa"
        }
      ]);
    });

    test("run correctly nested path", async () => {
      const mediaSource = await createMediaSource({
        path: "/a/b",
        name: "nested test"
      });

      const jobTask = {
        resourceId: mediaSource.id,
        config: {
          data: {
            refresh: false
          }
        },
        createdBy: 1
      };

      const result = await mediaSourceFetch(jobTask);
      expect(result).toEqual({ added: 4 });

      const mediaItemsAfter = await mediaSource.getMediaItems();
      expect(mediaItemsAfter).toMatchObject([
        {
          name: "1.jpg",
          path: "c"
        },
        {
          name: "2.jpg",
          path: "c"
        },
        {
          name: "3.jpg",
          path: ""
        },
        {
          name: "4.jpg",
          path: ""
        }
      ]);
    });
  });

  describe("s3 datasource", () => {
    const filesS3 = { ...files };
    beforeAll(async () => {
      data = await db.resetTestDb();
      mediaSource = await createMediaSource({ datasource: "s3" });
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
    });
    afterAll(() => {
      AWS.restore();
    });

    test("run correctly first time", async () => {
      const mediaItemsBefore = await mediaSource.getMediaItems();
      expect(mediaItemsBefore).toEqual([]);

      const jobTask = {
        resourceId: mediaSource.id,
        config: {
          data: {
            refresh: false
          }
        },
        createdBy: 1
      };
      const result = await mediaSourceFetch(jobTask);
      expect(result).toEqual({ added: 5 });

      const mediaItemsAfter = await mediaSource.getMediaItems();
      expect(mediaItemsAfter).toMatchObject([
        {
          createdBy: 1,
          mediaSourceId: mediaSource.id,
          metadata: {
            externalMetadata: {
              filter_date: "not_a_date",
              filter_integer: "not_an_integer",
              filter_string: "foo",
              fizz: "buzz",
              nested: {}
            },
            fileName: "1.jpg",
            importPathId: mediaSource.id,
            name: "1.jpg",
            resource: "a"
          },
          name: "1.jpg",
          path: "a",
          status: 1
        },
        {
          createdBy: 1,
          mediaSourceId: mediaSource.id,
          metadata: {
            externalMetadata: {
              filter_date: "2020-01-01",
              filter_integer: 1111,
              filter_string: "bar",
              foo: "bar",
              nested: {
                deep: {
                  filter_string: "nested_bar"
                }
              }
            },
            fileName: "1.jpg",
            importPathId: mediaSource.id,
            name: "1.jpg",
            resource: "a/b/c"
          },
          name: "1.jpg",
          path: "a/b/c",
          status: 1
        },
        {
          createdBy: 1,
          mediaSourceId: mediaSource.id,
          metadata: {
            fileName: "2.jpg",
            importPathId: mediaSource.id,
            name: "2.jpg",
            resource: "a/b/c"
          },
          name: "2.jpg",
          path: "a/b/c",
          status: 1
        },
        {
          createdBy: 1,
          mediaSourceId: mediaSource.id,
          metadata: {
            fileName: "3.jpg",
            importPathId: mediaSource.id,
            name: "3.jpg",
            resource: "a/b"
          },
          name: "3.jpg",
          path: "a/b",
          status: 1
        },
        {
          createdBy: 1,
          mediaSourceId: mediaSource.id,
          metadata: {
            fileName: "4.jpg",
            importPathId: mediaSource.id,
            name: "4.jpg",
            resource: "a/b"
          },
          name: "4.jpg",
          path: "a/b",
          status: 1
        }
      ]);

      const mediaItemTags = await MediaItemTag.findAll({
        where: {
          mediaItemId: {
            [Op.in]: mediaItemsAfter.map(mediaItem => mediaItem.id)
          }
        },
        raw: true
      });

      expect(mediaItemTags).toMatchObject([
        {
          mediaItemId: 7,
          name: "filter_string",
          type: 1,
          valueDatetime: null,
          valueInteger: null,
          valueString: "foo"
        },
        {
          mediaItemId: 10,
          name: "filter_date",
          type: 3,
          valueDatetime: "2020-01-01 00:00:00.000 +00:00",
          valueInteger: null,
          valueString: null
        },
        {
          mediaItemId: 10,
          name: "filter_integer",
          type: 2,
          valueDatetime: null,
          valueInteger: 1111,
          valueString: null
        },
        {
          mediaItemId: 10,
          name: "filter_string",
          type: 1,
          valueDatetime: null,
          valueInteger: null,
          valueString: "bar"
        },
        {
          mediaItemId: 10,
          name: "nested.deep.filter_string",
          type: 1,
          valueDatetime: null,
          valueInteger: null,
          valueString: "nested_bar"
        }
      ]);
    });

    test("run correctly refresh", async () => {
      // Add extra media items
      filesS3["/a/2.jpg"] = "binary";
      filesS3["/a/2.jpg.meta.json"] = `{"filter_string":"aaaa"}`;

      const jobTask = {
        resourceId: mediaSource.id,
        config: {
          data: {
            refresh: true
          }
        },
        createdBy: 1
      };

      const result = await mediaSourceFetch(jobTask);
      expect(result).toEqual({ added: 1 });

      const mediaItemsAfter = await mediaSource.getMediaItems();
      expect(mediaItemsAfter).toMatchObject([
        {
          name: "1.jpg",
          path: "a"
        },
        {
          name: "1.jpg",
          path: "a/b/c"
        },
        {
          createdBy: 1,
          mediaSourceId: mediaSource.id,
          metadata: {
            externalMetadata: {
              filter_string: "aaaa"
            },
            fileName: "2.jpg",
            importPathId: mediaSource.id,
            name: "2.jpg",
            resource: "a"
          },
          name: "2.jpg",
          path: "a",
          status: 1
        },
        {
          name: "2.jpg",
          path: "a/b/c"
        },
        {
          name: "3.jpg",
          path: "a/b"
        },
        {
          name: "4.jpg",
          path: "a/b"
        }
      ]);

      const mediaItemTags = await MediaItemTag.findAll({
        where: {
          mediaItemId: {
            [Op.in]: mediaItemsAfter.map(mediaItem => mediaItem.id)
          }
        },
        raw: true
      });

      expect(mediaItemTags).toMatchObject([
        {
          mediaItemId: 7,
          name: "filter_string"
        },
        {
          mediaItemId: 10,
          name: "filter_date"
        },
        {
          mediaItemId: 10,
          name: "filter_integer"
        },
        {
          mediaItemId: 10,
          name: "filter_string"
        },
        {
          mediaItemId: 10,
          name: "nested.deep.filter_string"
        },
        {
          mediaItemId: 12,
          name: "filter_string",
          type: 1,
          valueDatetime: null,
          valueInteger: null,
          valueString: "aaaa"
        }
      ]);
    });

    test("run correctly nested path", async () => {
      const mediaSource = await createMediaSource({
        path: "a/b",
        datasource: "s3"
      });

      const jobTask = {
        resourceId: mediaSource.id,
        config: {
          data: {
            refresh: false
          }
        },
        createdBy: 1
      };

      const result = await mediaSourceFetch(jobTask);
      expect(result).toEqual({ added: 4 });

      const mediaItemsAfter = await mediaSource.getMediaItems();
      expect(mediaItemsAfter).toMatchObject([
        {
          name: "1.jpg",
          path: "c"
        },
        {
          name: "2.jpg",
          path: "c"
        },
        {
          name: "3.jpg",
          path: ""
        },
        {
          name: "4.jpg",
          path: ""
        }
      ]);
    });
  });
});
