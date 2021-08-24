const package = require("../../package.json");

module.exports = function() {
  return package.version;
};
