const packages = require("../../package.json");

module.exports = function() {
  return packages.version;
};
