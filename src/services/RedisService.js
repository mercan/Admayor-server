const config = require("../config/index");
const redis = require("redis");
const logger = require("../helpers/logger");

class RedisService {
  constructor(options) {
    this.options = options;
    this.client = redis.createClient(this.options);

    this.client.on("connect", () =>
      logger.info("Connected to redis", { service: "Redis" })
    );
    this.client.on("error", (error) => {
      logger.error(`Redis error: ${error}`, { service: "Redis" });
    });
  }

  init() {
    return this.client;
  }
}

const options = {
  password: config.redis.password,
  host: config.redis.hostname,
  port: config.redis.port,
  no_ready_check: true,
};

module.exports = new RedisService(options);
