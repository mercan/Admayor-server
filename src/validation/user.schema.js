const Joi = require("joi");
const unavailableUsernames = require("../utils/unavailableUsername.json");

// Messages for Joi validation
const {
  emailMessage,
  usernameMessage,
  passwordMessage,
  codeMessage,
  objectMessage,
} = require("./user.messages");

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
      .messages(emailMessage),

    username: Joi.string()
      .required()
      .trim()
      .lowercase()
      .min(4)
      .max(16)
      .invalid(...unavailableUsernames)
      .messages(usernameMessage),

    password: Joi.string().required().min(6).max(100).messages(passwordMessage),
  })
  .required()
  .options(options)
  .messages(objectMessage);

const LoginSchema = Joi.object()
  .keys({
    email: Joi.string()
      .required()
      .trim()
      .lowercase()
      .email()
      .max(100)
      .messages(emailMessage),

    password: Joi.string().required().min(6).max(100).messages(passwordMessage),
  })
  .required()
  .options(options)
  .messages(objectMessage);

const ResetPasswordSchema = Joi.object()
  .keys({
    email: Joi.string()
      .required()
      .trim()
      .lowercase()
      .email()
      .max(100)
      .messages(emailMessage),
  })
  .required()
  .options(options)
  .messages(objectMessage);

const PasswordResetValidateSchema = Joi.object()
  .keys({
    code: Joi.string().required().messages(codeMessage),
    password: Joi.string().required().min(6).max(100).messages(passwordMessage),
  })
  .required()
  .options(options)
  .messages(objectMessage);

const ChangePasswordSchema = Joi.object()
  .keys({
    password: Joi.string().required().min(6).max(100).messages(passwordMessage),

    newPassword: Joi.string()
      .required()
      .min(6)
      .max(100)
      .messages(passwordMessage),
  })
  .required()
  .options(options)
  .messages(objectMessage);

const ChangeEmailSchema = Joi.object()
  .keys({
    email: Joi.string()
      .required()
      .trim()
      .lowercase()
      .email()
      .max(100)
      .messages(emailMessage),
  })
  .required()
  .options(options)
  .messages(objectMessage);

module.exports = {
  RegisterSchema,
  LoginSchema,
  ResetPasswordSchema,
  PasswordResetValidateSchema,
  ChangePasswordSchema,
  ChangeEmailSchema,
};
