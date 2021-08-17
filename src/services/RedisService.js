const redis = require("redis");
const { redis: redisConfig } = require("../config/index");
const logger = require("../helpers/logger");

class RedisService {
  constructor(options) {
    this.options = options;
    this.client = redis.createClient(this.options);

    this.client.on("connect", () => {
      logger.info("Connected to Redis", { service: "Redis" });
    });

    this.client.on("error", (error) => {
      logger.error(`Redis error: ${error}`, { service: "Redis" });
    });
  }

  init() {
    return this.client;
  }
}

const options = {
  password: redisConfig.password,
  host: redisConfig.hostname,
  port: redisConfig.port,
  no_ready_check: true,
};

module.exports = new RedisService(options);
