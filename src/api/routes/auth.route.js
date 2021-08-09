const config = require("../../config/index");
const authController = require("../controllers/auth.controller");

// Schema
const registerSchema = require("../../schema/auth/RegisterSchema.json");
const loginSchema = require("../../schema/auth/LoginSchema.json");
const sendVerificationEmailSchema = require("../../schema/auth/SendVerificationEmailSchema.json");
const emailVerifySchema = require("../../schema/auth/EmailVerifySchema.json");
const resetPasswordSchema = require("../../schema/auth/ResetPasswordSchema.json");
const sendResetPasswordEmailSchema = require("../../schema/auth/SendResetPasswordEmailSchema.json");

const routes = [
  {
    method: "POST",
    url: `/${config.apiVersion}/${config.authRoutePath}/register`,
    schema: registerSchema,
    config: {
      rateLimit: {
        max: config.rateLimit.auth.register.max,
        timeWindow: config.rateLimit.auth.register.timeWindow,
      },
    },
    handler: authController.register,
  },
  {
    method: "POST",
    url: `/${config.apiVersion}/${config.authRoutePath}/login`,
    schema: loginSchema,
    config: {
      rateLimit: {
        max: config.rateLimit.auth.login.max,
        timeWindow: config.rateLimit.auth.login.timeWindow,
      },
    },
    handler: authController.login,
  },
  {
    method: "POST",
    url: `/${config.apiVersion}/${config.authRoutePath}/emailVerify`,
    schema: emailVerifySchema,
    config: {
      rateLimit: {
        max: config.rateLimit.auth.emailVerify.max,
        timeWindow: config.rateLimit.auth.emailVerify.timeWindow,
      },
    },
    handler: authController.emailVerify,
  },
  {
    method: "GET",
    url: `/${config.apiVersion}/${config.authRoutePath}/emailVerify`,
    schema: sendVerificationEmailSchema,
    config: {
      rateLimit: {
        max: config.rateLimit.auth.sendVerificationEmail.max,
        timeWindow: config.rateLimit.auth.sendVerificationEmail.timeWindow,
      },
    },
    handler: authController.sendVerificationEmail,
  },
  {
    method: "POST",
    url: `/${config.apiVersion}/${config.authRoutePath}/resetPassword`,
    schema: resetPasswordSchema,
    config: {
      rateLimit: {
        max: config.rateLimit.auth.resetPassword.max,
        timeWindow: config.rateLimit.auth.resetPassword.timeWindow,
      },
    },
    handler: authController.resetPassword,
  },
  {
    method: "GET",
    url: `/${config.apiVersion}/${config.authRoutePath}/resetPassword`,
    schema: sendResetPasswordEmailSchema,
    handler: authController.sendPasswordResetEmail,
  },
];

module.exports = routes;
