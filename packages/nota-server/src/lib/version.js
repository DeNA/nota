const packageJson = require("../../package.json");

module.exports = function() {
  return packageJson.version;
};
