const Joi = require("joi");
const unavailableUsername = require("../utils/unavailableUsername.json");

const options = {
  stripUnknown: false,
  convert: true,
  allowUnknown: true,
};

const RegisterSchema = Joi.object()
  .keys({
    email: Joi.string()
      .required()
      .trim()
      .lowercase()
      .email()
      .max(100)
      .messages({
        "string.max": "Email must be 100 characters or less.",
        "string.email": "Please enter a valid email address.",
        "string.empty": "Please enter your email address.",
        "any.required": "Please enter your email address.",
      }),

    username: Joi.string()
      .required()
      .trim()
      .lowercase()
      .min(4)
      .max(16)
      .invalid(...unavailableUsername)
      .messages({
        "string.min": "Please enter a username with at least 4 characters.",
        "string.max": "Please enter a username with at most 16 characters.",
        "string.empty": "Please enter your username.",
        "any.invalid": "This username is unavailable.",
        "any.required": "Please enter your username.",
      }),

    password: Joi.string().required().min(6).max(100).messages({
      "string.min": "Please enter a password with at least 6 characters.",
      "string.max": "Please enter a password with at most 100 characters.",
      "string.empty": "Please enter your password.",
      "any.required": "Please enter your password.",
    }),
  })
  .required()
  .options(options)
  .messages({
    "object.base": "Please fill out all required fields.",
  });

const LoginSchema = Joi.object()
  .keys({
    email: Joi.string()
      .required()
      .trim()
      .lowercase()
      .email()
      .max(100)
      .messages({
        "string.max": "Email must be 100 characters or less.",
        "string.email": "Please enter a valid email address.",
        "string.empty": "Please enter your email address.",
        "any.required": "Please enter your email address.",
      }),

    password: Joi.string().required().min(6).max(100).messages({
      "string.min": "Please enter a password with at least 6 characters.",
      "string.max": "Please enter a password with at most 100 characters.",
      "string.empty": "Please enter your password.",
      "any.required": "Please enter your password.",
    }),
  })
  .required()
  .options(options)
  .messages({
    "object.base": "Please fill out all required fields.",
  });

const ResetPasswordSchema = Joi.object()
  .keys({
    email: Joi.string()
      .required()
      .trim()
      .lowercase()
      .email()
      .max(100)
      .messages({
        "string.max": "Email must be 100 characters or less.",
        "string.email": "Please enter a valid email address.",
        "string.empty": "Please enter your email address.",
        "any.required": "Please enter your email address.",
      }),
  })
  .required()
  .options(options)
  .messages({
    "object.base": "Please fill out all required fields.",
  });

const PasswordResetValidateSchema = Joi.object()
  .keys({
    code: Joi.string().required().messages({
      "any.required": "Code is required.",
    }),

    password: Joi.string().required().min(6).max(100).messages({
      "string.min": "Please enter a password with at least 6 characters.",
      "string.max": "Please enter a password with at most 100 characters.",
      "string.empty": "Please enter your password.",
      "any.required": "Please enter your password.",
    }),
  })
  .required()
  .options(options)
  .messages({
    "object.base": "Please fill out all required fields.",
  });

const ChangePasswordSchema = Joi.object()
  .keys({
    password: Joi.string().required().min(6).max(100).messages({
      "string.min": "Please enter a password with at least 6 characters.",
      "string.max": "Please enter a password with at most 100 characters.",
      "string.empty": "Please enter your password.",
      "any.required": "Please enter your password.",
    }),

    newPassword: Joi.string().required().min(6).max(100).messages({
      "string.min": "Please enter a password with at least 6 characters.",
      "string.max": "Please enter a password with at most 100 characters.",
      "string.empty": "Please enter your password.",
      "any.required": "Please enter your password.",
    }),
  })
  .required()
  .options(options)
  .messages({
    "object.base": "Please fill out all required fields.",
  });

module.exports = {
  RegisterSchema,
  LoginSchema,
  ResetPasswordSchema,
  PasswordResetValidateSchema,
  ChangePasswordSchema,
};
