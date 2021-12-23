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

  disconnect() {
    this.client.quit();
  }

  setKey(key, value, expireTime) {
    return new Promise((resolve, reject) => {
      this.client.set(key, value, "EX", expireTime, (err, result) => {
        if (err) {
          return reject(err);
        }

        resolve(result);
      });
    });
  }

  deleteKey(key, userId) {
    return new Promise((resolve, reject) => {
      this.client.del(`${key}:${userId}`, (err, result) => {
        if (err) {
          return reject(err);
        }

        resolve(result);
      });
    });
  }

  getCode(key, userId) {
    return new Promise((resolve, reject) => {
      this.client.get(`${key}:${userId}`, (err, result) => {
        if (err) {
          return reject(err);
        }

        resolve(result);
      });
    });
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
