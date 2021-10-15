const mocks = {
  writeItem: jest.fn(() => "/path/to/test/export.tar.gz"),
  getDownloadUrl: jest.fn(({ fileName }) => fileName)
};

module.exports = function() {
  return mocks;
};
