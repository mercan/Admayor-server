const redis = require("redis");
const { redis: redisConfig } = require("../config/index");
const logger = require("../helpers/logger");

class RedisService {
  constructor(options) {
    this.options = options;
    this.client = redis.createClient(this.options);

    this.client.on("connect", () => {
      logger.info("Connection to Redis", { service: "Redis" });
    });

    this.client.on("error", (error) => {
      logger.error(`Connection failed: ${error}`, { service: "Redis" });
    });
  }

  init() {
    return this.client;
  }
}

// Redis Config
const options = {
  password: redisConfig.password,
  host: redisConfig.hostname,
  port: redisConfig.port,
  no_ready_check: true,
};

// Create Redis Service
module.exports = new RedisService(options);
