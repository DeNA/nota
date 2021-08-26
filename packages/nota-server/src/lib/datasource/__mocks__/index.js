const { Readable } = require("stream");

const DEFAULT_FILES = {
  "a/b/c/1.jpg": {
    name: "1.jpg",
    metadata: { importPathId: 1, resource: "a/b/c", fileName: "1.jpg" },
    value: "binary"
  },
  "a/b/c/1.jpg.meta.json": {
    name: "1.jpg.meta.json",
    metadata: {
      importPathId: 1,
      resource: "a/b/c",
      fileName: "1.jpg.meta.json"
    },
    value: `{"filter_string":"bar","filter_integer":1111,"filter_date":"2020-01-01","foo":"bar","nested":{"deep":{"filter_string":"nested_bar"}}}`
  },
  "a/b/c/2.jpg": {
    name: "2.jpg",
    metadata: { importPathId: 1, resource: "a/b/c", fileName: "2.jpg" },
    value: "binary"
  },
  "a/b/3.jpg": {
    name: "3.jpg",
    metadata: { importPathId: 1, resource: "a/b", fileName: "3.jpg" },
    value: "binary"
  },
  "a/b/4.jpg": {
    name: "4.jpg",
    metadata: { importPathId: 1, resource: "a/b", fileName: "4.jpg" },
    value: "binary"
  },
  "a/b/1.mp4": {
    name: "1.mp4",
    metadata: { importPathId: 1, resource: "a/b", fileName: "1.mp4" },
    value: "binary"
  },
  "a/b/2.mp4": {
    name: "2.mp4",
    metadata: { importPathId: 1, resource: "a/b", fileName: "2.mp4" },
    value: "binary"
  },
  "a/1.jpg": {
    name: "1.jpg",
    metadata: { importPathId: 1, resource: "a", fileName: "1.jpg" },
    value: "binary"
  },
  "a/1.jpg.json": {
    name: "1.jpg.json",
    metadata: { importPathId: 1, resource: "a", fileName: "1.jpg.json" },
    value: `{"annotations":[{"type":"typeA","labels":{"foo":"bar"},"boundaries":{"type":"RECTANGLE","top":10,"bottom":10,"left":10,"right":10}}]}`
  },
  "a/1.jpg.meta.json": {
    name: "1.jpg.meta.json",
    metadata: {
      importPathId: 1,
      resource: "a",
      fileName: "1.jpg.meta.json"
    },
    value: `{"filter_string": "foo", "filter_integer": "not_an_integer","filter_date":"not_a_date","fizz":"buzz","nested":{}}`
  }
};
let files = DEFAULT_FILES;

const mocks = {
  listResources: jest.fn(),
  listItems: jest.fn(async () => {
    return Object.values(files);
  }),
  statItem: jest.fn(async ({ metadata = {} }) => {
    return files[`${metadata.resource}/${metadata.fileName}`]
      ? { size: 111 }
      : null;
  }),
  readItem: jest.fn(async ({ metadata = {} }) => {
    const file = files[`${metadata.resource}/${metadata.fileName}`];

    if (!file) {
      throw new Error("file not found");
    }

    return Readable.from(file.value);
  }),
  writeItem: jest.fn(() => "/path/to/test/export.tar.gz"),
  getDownloadUrl: jest.fn(({ fileName }) => fileName),
  _getFilesForTest: () => files,
  _setFilesForTest: newFiles => {
    files = newFiles;
  },
  _resetFilesForTest: () => {
    files = DEFAULT_FILES;
  }
};

module.exports = function() {
  return mocks;
};
