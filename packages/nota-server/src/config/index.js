const dotenv = require("dotenv");
dotenv.config();

const env = process.env.NODE_ENV || "development";
const config = require(`./config.${env}.json`);
console.log(`NODE_ENV: ${env}`);

// Override APP vars from ENV
const environtmentVars = {
  NOTA_APP_PORT: "port"
};

Object.keys(environtmentVars).forEach(variable => {
  if (process.env[variable]) {
    config[environtmentVars[variable]] = process.env[variable];
  }
});

// Override DB vars from ENV
config.db = config.db || {};
const dbEnvirontmentVars = {
  NOTA_DB_HOST: "host",
  NOTA_DB_PORT: "port",
  NOTA_DB_DATABASE: "database",
  NOTA_DB_USERNAME: "username",
  NOTA_DB_PASSWORD: "password"
};

Object.keys(dbEnvirontmentVars).forEach(variable => {
  if (process.env[variable]) {
    config.db[dbEnvirontmentVars[variable]] = process.env[variable];
  }
});

// Override redis vars from ENV
config.redis = config.redis || {};
const redisEnvirontmentVars = {
  NOTA_REDIS_HOST: "host",
  NOTA_REDIS_PORT: "port"
};

Object.keys(redisEnvirontmentVars).forEach(variable => {
  if (process.env[variable]) {
    config.redis[redisEnvirontmentVars[variable]] = process.env[variable];
  }
});

// Override Authenticators from ENV
if (process.env["NOTA_AUTHENTICATORS"]) {
  config.authenticators = JSON.parse(process.env["NOTA_AUTHENTICATORS"]);
}
if (process.env["NOTA_AUTHENTICATORS_CONFIG"]) {
  config.authenticatorsConfig = JSON.parse(
    process.env["NOTA_AUTHENTICATORS_CONFIG"]
  );
}

module.exports = config;
