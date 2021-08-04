require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3000,
  databaseURL: process.env.MONGODB_URI,
  jwtSecretKey: process.env.JWT_SECRET,
  jwtAlgorithm: process.env.JWT_ALGO,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  logger: {
    level: process.env.LOG_LEVEL || "error",
  },
  redis: {
    hostname: process.env.REDIS_HOSTNAME,
    password: process.env.REDIS_PASSWORD,
    port: process.env.REDIS_PORT,
  },
  rateLimit: {
    auth: {
      signup: {
        max: Number(process.env.RATE_LIMIT_AUTH_SIGNUP_MAX),
        timeWindow: Number(process.env.RATE_LIMIT_AUTH_SIGNUP_TIME_WINDOW),
      },
      signIn: {
        max: Number(process.env.RATE_LIMIT_AUTH_SIGNIN_MAX),
        timeWindow: Number(process.env.RATE_LIMIT_AUTH_SIGNIN_TIME_WINDOW),
      },
    },
  },
};
