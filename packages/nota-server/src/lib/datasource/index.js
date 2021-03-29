const fs = require("fs-extra");
const { logger } = require("../logger");

const dirFiles = fs.readdirSync(__dirname);
const datasources = dirFiles.reduce((datasources, datasource) => {
  if (datasource === "index.js" || !datasource.endsWith(".js")) {
    return datasources;
  }

  try {
    datasources[
      datasource.slice(0, datasource.length - 3)
    ] = require(`${__dirname}/${datasource}`);
  } catch (error) {
    logger.warn(error);
  }

  return datasources;
}, {});

const getDatasource = function(id) {
  if (!datasources[id]) {
    throw new Error(`datasource ${id} not found`);
  }

  return datasources[id];
};

module.exports = function(mediaSource) {
  const datasource = getDatasource(mediaSource.datasource);
  const config = {
    ...mediaSource.config,
    importPaths: [{ id: mediaSource.id, path: mediaSource.config.path }],
    exportPath: mediaSource.config.exportPath || mediaSource.config.path || ""
  };

  return {
    listResources: (...args) => datasource.listResources(config, ...args),
    listItems: (...args) => datasource.listItems(config, ...args),
    statItem: (...args) => datasource.statItem(config, ...args),
    readItem: (...args) => datasource.readItem(config, ...args),
    writeItem: (...args) => datasource.writeItem(config, ...args),
    getDownloadUrl: (...args) => datasource.getDownloadUrl(config, ...args)
  };
};
