jest.mock("../lib/datasource");
const { db } = require("../lib/testUtils");
const mediaSourceFetch = require("./mediaSourceFetch");
const { MediaSource, MediaItemTag } = require("../models");
const { Op } = require("sequelize");
const ds = require("../lib/datasource");

let mediaSource;
let data;

const createMediaSource = async function() {
  const newMediaSource = await db.createMediaSource({
    name: "media_source test",
    description: "media_source test description",
    projectId: data.projects.project1.id,
    datasource: "s3",
    status: MediaSource.STATUS.READY,
    config: {
      extensions: ["jpg"],
      bucket: "dummy-bucket",
      path: "",
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

beforeAll(async () => {
  await db.resetTestDb();
  data = await db.generateTestData();
  // @ts-ignore
  ds()._resetFilesForTest();
  mediaSource = await createMediaSource();
});

afterAll(() => {
  // @ts-ignore
  ds()._resetFilesForTest();
});

describe("mediaSourceFetch", () => {
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

    await new Promise(async (resolve) => {
      mediaSourceFetch(jobTask, async (result) => {
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
              importPathId: 1,
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
              importPathId: 1,
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
              importPathId: 1,
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
              importPathId: 1,
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
              importPathId: 1,
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
              [Op.in]: mediaItemsAfter.map((mediaItem) => mediaItem.id)
            }
          },
          raw: true
        });

        expect(mediaItemTags).toMatchObject([
          {
            mediaItemId: 7,
            name: "filter_date",
            type: 3,
            valueDatetime: "2020-01-01 00:00:00.000 +00:00",
            valueInteger: null,
            valueString: null
          },
          {
            mediaItemId: 7,
            name: "filter_integer",
            type: 2,
            valueDatetime: null,
            valueInteger: 1111,
            valueString: null
          },
          {
            mediaItemId: 7,
            name: "filter_string",
            type: 1,
            valueDatetime: null,
            valueInteger: null,
            valueString: "bar"
          },
          {
            mediaItemId: 7,
            name: "nested.deep.filter_string",
            type: 1,
            valueDatetime: null,
            valueInteger: null,
            valueString: "nested_bar"
          },
          {
            mediaItemId: 11,
            name: "filter_string",
            type: 1,
            valueDatetime: null,
            valueInteger: null,
            valueString: "foo"
          }
        ]);

        resolve(true);
      });
    });
  });

  test("run correctly refresh", async () => {
    // @ts-ignore
    const files = { ...ds()._getFilesForTest() };
    files["a/2.jpg"] = {
      name: "2.jpg",
      metadata: { importPathId: 1, resource: "a", fileName: "2.jpg" },
      value: "binary"
    };
    files["a/2.jpg.meta.json"] = {
      name: "2.jpg.meta.json",
      metadata: { importPathId: 1, resource: "a", fileName: "2.jpg.meta.json" },
      value: `{"filter_string":"aaaa"}`
    };
    // @ts-ignore
    ds()._setFilesForTest(files);

    const jobTask = {
      resourceId: mediaSource.id,
      config: {
        data: {
          refresh: true
        }
      },
      createdBy: 1
    };

    await new Promise(async (resolve) => {
      mediaSourceFetch(jobTask, async (result) => {
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
            mediaSourceId: 4,
            metadata: {
              externalMetadata: {
                filter_string: "aaaa"
              },
              fileName: "2.jpg",
              importPathId: 1,
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
              [Op.in]: mediaItemsAfter.map((mediaItem) => mediaItem.id)
            }
          },
          raw: true
        });

        expect(mediaItemTags).toMatchObject([
          {
            mediaItemId: 7,
            name: "filter_date",
            type: 3,
            valueDatetime: "2020-01-01 00:00:00.000 +00:00",
            valueInteger: null,
            valueString: null
          },
          {
            mediaItemId: 7,
            name: "filter_integer",
            type: 2,
            valueDatetime: null,
            valueInteger: 1111,
            valueString: null
          },
          {
            mediaItemId: 7,
            name: "filter_string",
            type: 1,
            valueDatetime: null,
            valueInteger: null,
            valueString: "bar"
          },
          {
            mediaItemId: 7,
            name: "nested.deep.filter_string",
            type: 1,
            valueDatetime: null,
            valueInteger: null,
            valueString: "nested_bar"
          },
          {
            mediaItemId: 11,
            name: "filter_string",
            type: 1,
            valueDatetime: null,
            valueInteger: null,
            valueString: "foo"
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

        resolve(true);
      });
    });
  });
});
