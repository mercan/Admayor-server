require("dotenv").config();

const port = process.env.PORT || 3000;
const env = process.env.NODE_ENV;

module.exports = {
  env,
  port,
  databaseURL: process.env.MONGODB_URI,
  jwtSecretKey: process.env.JWT_SECRET,
  jwtAlgorithm: process.env.JWT_ALGO,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
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
      register: {
        max: Number(process.env.RATE_LIMIT_AUTH_SIGNUP_MAX),
        timeWindow: Number(process.env.RATE_LIMIT_AUTH_SIGNUP_TIME_WINDOW),
      },

      login: {
        max: Number(process.env.RATE_LIMIT_AUTH_SIGNIN_MAX),
        timeWindow: Number(process.env.RATE_LIMIT_AUTH_SIGNIN_TIME_WINDOW),
      },

      emailVerify: {
        max: Number(process.env.RATE_LIMIT_AUTH_EMAIL_VERIFY_MAX),
        timeWindow: Number(
          process.env.RATE_LIMIT_AUTH_EMAIL_VERIFY_TIME_WINDOW
        ),
      },

      sendVerificationEmail: {
        max: Number(process.env.RATE_LIMIT_AUTH_VERIFICATION_EMAIL_MAX),
        timeWindow: Number(
          process.env.RATE_LIMIT_AUTH_VERIFICATION_EMAIL_TIME_WINDOW
        ),
      },

      resetPassword: {
        max: Number(process.env.RATE_LIMIT_AUTH_RESET_PASSWORD_MAX),
        timeWindow: Number(
          process.env.RATE_LIMIT_AUTH_RESET_PASSWORD_TIME_WINDOW
        ),
      },

      sendResetPasswordEmail: {
        max: Number(process.env.RATE_LIMIT_AUTH_RESET_PASSWORD_EMAIL_MAX),
        timeWindow: Number(
          process.env.RATE_LIMIT_AUTH_RESET_PASSWORD_EMAIL_TIME_WINDOW
        ),
      },

      changePassword: {
        max: Number(process.env.RATE_LIMIT_AUTH_CHANGE_PASSWORD_MAX),
        timeWindow: Number(
          process.env.RATE_LIMIT_AUTH_CHANGE_PASSWORD_TIME_WINDOW
        ),
      },

      changeEmail: {
        max: Number(process.env.RATE_LIMIT_AUTH_CHANGE_EMAIL_MAX),
        timeWindow: Number(
          process.env.RATE_LIMIT_AUTH_CHANGE_EMAIL_TIME_WINDOW
        ),
      },
    },
  },
  logs: {
    path: process.env.NODE_ENV === "test" ? "./logs/test" : "./logs",
    fileName: "%DATE%",
    extension: ".log",
    dataPattern: "YYYY-MM-DD",
  },
  swaggerRoutePrefix: "/documentation",
  apiVersion: "v1",
  authRoutePath: "auth",
  dateFormat: "YYYY-MM-DD HH:mm:ss",
};
