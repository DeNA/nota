const winston = require("winston");
const expressWinston = require("express-winston");

module.exports = {
  accessLogger: expressWinston.logger({
    transports: [new winston.transports.Console()],
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
    transports: [new winston.transports.Console()],
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
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  })
};
