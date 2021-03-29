const fs = require("fs-extra");
const { logger } = require("../logger");

const dirFiles = fs.readdirSync(__dirname);
const parsers = dirFiles.reduce((parsers, parser) => {
  if (parser === "index.js" || !parser.endsWith(".js")) {
    return parsers;
  }

  try {
    parsers[
      parser.slice(0, parser.length - 3)
    ] = require(`${__dirname}/${parser}`);
  } catch (error) {
    logger.error(error);
  }

  return parsers;
}, {});

const getParser = function(id) {
  if (!parsers[id]) {
    throw new Error(`parser ${id} not found`);
  }

  return parsers[id];
};

module.exports = function(profile = "json") {
  const parser = getParser(profile);

  return {
    serialize: (...args) => parser.serialize(...args),
    parse: (...args) => parser.parse(...args)
  };
};
