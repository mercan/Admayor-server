require("dotenv").config();

const port = process.env.PORT || 3000;
const env = process.env.NODE_ENV;

module.exports = {
  env,
  port,
  host:
    env === "development" ? `${process.env.HOST}:${port}` : process.env.HOST,
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
  swaggerRoutePrefix: "/documentation",
  apiVersion: "v1",
  authRoutePath: "auth",
};
