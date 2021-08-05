const config = require("../../config/index");
const authController = require("../controllers/auth.controller");

const routes = [
  {
    method: "POST",
    url: "/auth/signup/",
    config: {
      rateLimit: {
        max: config.rateLimit.auth.signup.max,
        timeWindow: config.rateLimit.auth.signup.timeWindow,
      },
    },
    handler: authController.signup,
  },
  {
    method: "POST",
    url: "/auth/signIn/",
    config: {
      rateLimit: {
        max: config.rateLimit.auth.signIn.max,
        timeWindow: config.rateLimit.auth.signIn.timeWindow,
      },
    },
    handler: authController.signIn,
  },
  {
    method: "GET",
    url: "/auth/emailVerify",
    config: {
      rateLimit: {
        max: config.rateLimit.auth.emailVerify.max,
        timeWindow: config.rateLimit.auth.emailVerify.timeWindow,
      },
    },
    handler: authController.emailVerify,
  },
];

module.exports = routes;
