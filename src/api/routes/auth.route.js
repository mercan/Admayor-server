const config = require("../../config/index");
const authController = require("../controllers/auth.controller");
const tokenVerifier = require("../../middleware/tokenVerifier");

// Schema
const signupSchema = require("../../schema/auth/SignupSchema.json");
const signinSchema = require("../../schema/auth/SigninSchema.json");
const sendVerificationEmailSchema = require("../../schema/auth/SendVerificationEmailSchema.json");
const emailVerifySchema = require("../../schema/auth/EmailVerifySchema.json");

const routes = [
  {
    method: "POST",
    url: "/auth/signup/",
    schema: signupSchema,
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
    schema: signinSchema,
    config: {
      rateLimit: {
        max: config.rateLimit.auth.signIn.max,
        timeWindow: config.rateLimit.auth.signIn.timeWindow,
      },
    },
    handler: authController.signIn,
  },
  {
    method: "POST",
    url: "/auth/sendVerificationEmail/",
    schema: sendVerificationEmailSchema,
    config: {
      rateLimit: {
        max: config.rateLimit.auth.sendVerificationEmail.max,
        timeWindow: config.rateLimit.auth.sendVerificationEmail.timeWindow,
        allowList: function (req) {
          return req.headers["authorization"] !== undefined;
        },
      },
    },
    preValidation: tokenVerifier,
    handler: authController.sendVerificationEmail,
  },
  {
    method: "POST",
    url: "/auth/emailVerify",
    schema: emailVerifySchema,
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
