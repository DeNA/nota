const express = require("express");
const helmet = require("helmet");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const compression = require("compression");
const { accessLogger, errorLogger } = require("./lib/logger");

const app = express();

// Initialize DB
require("./models");

// Auth setup
const auth = require("./lib/auth");
auth.init();

// Requests/Responses settings
app.use(helmet());
app.use(compression());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Access logging
app.use(accessLogger);

// Static assets
app.use(express.static(path.join(__dirname, "public")));

// Api routes
const authApi = require("./routes/auth");
const router = require("./routes");
app.use("/auth", authApi);
app.use("/api", auth.token, router, function(req, res, next) {
  const response =
    res.locals.response && res.locals.responseTemplate
      ? res.locals.responseTemplate(res.locals.response)
      : res.locals.response;

  if (response) {
    res.json(response);
  } else {
    next();
  }
});

// Healthcheck
app.use("/_chk", function(req, res, next) {
  res.json({ ok: true });
});

// catch 404 and forward to error handler
app.use("/api", function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// redirect other to SPA
app.use(function(req, res, next) {
  res.sendFile(path.resolve("public/index.html"));
});

// Filter Errors
app.use(function(err, req, res, next) {
  if (err instanceof require("sequelize").ValidationError) {
    err.status = 400;
  }

  next(err);
});

// Error logging
app.use(errorLogger);

// Error handler
app.use(function(err, req, res, next) {
  const status = err.status || 500;
  let message = err.message;

  if (status === 500 && req.app.get("env") !== "development") {
    message = "Something bad happened";
  }

  res.status(status);
  res.send({ message });
});

module.exports = app;
