require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3000,
  base_url: process.env.BASE_URL || "http://localhost:3000",
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
  service: {
    email: {
      API_KEY: process.env.EMAIL_API_KEY,
      from: process.env.EMAIL_FROM,
    },
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

      sendVerificationEmail: {
        max: Number(process.env.RATE_LIMIT_AUTH_VERIFICATION_EMAIL_MAX),
        timeWindow: Number(
          process.env.RATE_LIMIT_AUTH_VERIFICATION_EMAIL_TIME_WINDOW
        ),
      },

      emailVerify: {
        max: Number(process.env.RATE_LIMIT_AUTH_EMAIL_VERIFY_MAX),
        timeWindow: Number(
          process.env.RATE_LIMIT_AUTH_EMAIL_VERIFY_TIME_WINDOW
        ),
      },
    },
  },
};
