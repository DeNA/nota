const mocks = {
  listResources: jest.fn(),
  listItems: jest.fn(),
  statItem: jest.fn(),
  readItem: jest.fn(),
  writeItem: jest.fn(),
  getDownloadUrl: jest.fn(({ fileName }) => fileName)
};

module.exports = function() {
  return mocks;
};
