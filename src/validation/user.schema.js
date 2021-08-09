const Joi = require("joi");

const options = {
  stripUnknown: true,
  convert: true,
  allowUnknown: false,
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
      .messages({
        "string.min": "Please enter a username with at least 4 characters.",
        "string.max": "Please enter a username with at most 16 characters.",
        "string.empty": "Please enter your username.",
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
    email: Joi.string().required().trim().lowercase().email().max(50).messages({
      "string.max": "Email must be 50 characters or less.",
      "string.email": "Please enter a valid email address.",
      "string.empty": "Please enter your email address.",
      "any.required": "Please enter your email address.",
    }),

    password: Joi.string().required().min(6).max(50).messages({
      "string.min": "Please enter a password with at least 6 characters.",
      "string.max": "Please enter a password with at most 50 characters.",
      "string.empty": "Please enter your password.",
      "any.required": "Please enter your password.",
    }),
  })
  .required()
  .options(options)
  .messages({
    "object.base": "Please fill out all required fields.",
  });

const PasswordResetSchema = Joi.object()
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
    token: Joi.string().required().messages({
      "any.required": "Token is required.",
    }),

    password: Joi.string().required().min(6).max(50).messages({
      "string.min": "Please enter a password with at least 6 characters.",
      "string.max": "Please enter a password with at most 50 characters.",
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
  PasswordResetSchema,
  PasswordResetValidateSchema,
};
