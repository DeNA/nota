const winston = require("winston");
const expressWinston = require("express-winston");

// Silence logs output in tests
const consoleOptions = {
  silent: process.env.NODE_ENV === "test"
};

module.exports = {
  accessLogger: expressWinston.logger({
    transports: [new winston.transports.Console(consoleOptions)],
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    baseMeta: {
      logType: "access_log"
    },
    expressFormat: true,
    dynamicMeta: function(req, res) {
      return {
        user: req.user ? req.user.id : null
      };
    }
  }),
  errorLogger: expressWinston.errorLogger({
    transports: [new winston.transports.Console(consoleOptions)],
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    baseMeta: {
      logType: "error_log"
    },
    dynamicMeta: function(req, res) {
      return {
        user: req.user ? req.user.id : null
      };
    }
  }),
  logger: winston.createLogger({
    transports: [new winston.transports.Console(consoleOptions)],
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  })
};
