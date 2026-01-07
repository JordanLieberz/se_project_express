const winston = require("winston");
const expressWinston = require("express-winston");

// Create a custom formatter
const messageFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(
    ({ level, message, meta, timestamp }) =>
      `${timestamp} ${level}: ${meta?.error?.stack || message}`
  )
);

// Request logger
const requestLogger = expressWinston.logger({
  transports: [new winston.transports.File({ filename: "request.log" })],
  format: messageFormat,
});

const errorLogger = expressWinston.errorLogger({
  transports: [new winston.transports.File({ filename: "error.log" })],
  format: messageFormat,
});

module.exports = {
  requestLogger,
  errorLogger,
};
