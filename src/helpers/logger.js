const winston = require("winston");
const dayjs = require("dayjs");
const config = require("../config/index");

const loggerFormat = winston.format.combine(
    winston.format.timestamp({
      format: config.logger.dateFormat,
    }),
    winston.format.metadata({
      fillExcept: ["message", "level", "timestamp", "service"],
    }),
    winston.format.printf((msg) => {
      const { message } = msg;
      const { service, timestamp, level } = msg;

      if (service === "Fastify") {
        const request = message.req;
        const response = message.res;

        if (request) {
          return `{"service": "${service}", "timestamp": "${timestamp}", "level": "${level}", "message": "Incoming Request", "reqId": "${request.id}", "url": "${request.url}", "method": "${request.method}", "ip": "${request.ip}", "User-Agent": "${request.headers["user-agent"]}"}`;
        }

        if (response) {
          if (message.err) {
            return `{"service": "${service}", "timestamp": "${timestamp}", "level": "${level}", "message": "Request Error", "error": "${message.err.message}", "error stack": "${message.err.stack}", "reqId": "${response.request.id}", "url": "${response.request.url}", "method": "${response.request.method}", "ip": "${response.request.ip}", "User-Agent": "${response.request.headers["user-agent"]}"}`;
          }

          return `{"service": "${service}", "timestamp": "${timestamp}", "level": "${level}", "message": "Request Completed", "status": "${
              response.statusCode
          }", "response time": "${
              Math.round(message.responseTime * 100) / 100
          }ms", "reqId": "${response.request.id}", "url": "${
              response.request.url
          }", "method": "${response.request.method}", "ip": "${
              response.request.ip
          }", "User-Agent": "${response.request.headers["user-agent"]}"}`;
        }
      }

      if (!message.req || !message.res) {
        return `{"service": "${service}", "timestamp": "${timestamp}", "level": "${level}", "message": "${message}"}`;
      }
    })
);

module.exports = (() => {
  return new winston.createLogger({
    defaultMeta: { service: "Fastify" },
    levels: Object.assign(
        { fatal: 0, warn: 4, trace: 7 },
        winston.config.syslog.levels
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize({ level: true }),
            loggerFormat
        ),
      }),
      new (require("winston-daily-rotate-file"))({
        format: loggerFormat,
        dirname: config.logger.path,
        filename: config.logger.fileName,
        extension: config.logger.extension,
        timestamp: () => dayjs().format(config.logger.timestampPattern),
        dataPattern: config.logger.dateFormat,
        zippedArchive: config.env !== "development",
      }),
    ],
  });
})();
