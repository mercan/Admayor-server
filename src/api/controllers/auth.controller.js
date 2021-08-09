const UserService = require("../../services/UserService");
const verifyToken = require("../../utils/verifyToken");
const unavailableUsernames = require("../../utils/unavailableUsername.json");
const unavailableEmails = require("../../utils/unavailableEmail.json");

// User Validation
const {
  RegisterSchema,
  LoginSchema,
  PasswordResetSchema,
  PasswordResetValidateSchema,
} = require("../../validation/user.schema");

const register = async (req, res) => {
  const { error, value: User } = RegisterSchema.validate(req.body);

  if (error) {
    return res.status(400).send({
      statusCode: 400,
      message: error.details[0].message,
    });
  }

  if (unavailableEmails.some((email) => email === User.email.split("@")[1])) {
    return res.status(400).send({
      statusCode: 400,
      message: "Email is not available.",
    });
  }

  if (unavailableUsernames.includes(User.username)) {
    return res.status(400).send({
      statusCode: 400,
      message: "Username is not available.",
    });
  }

  const result = await UserService.Register(User);

  if (result.error) {
    return res.status(409).send({
      statusCode: 409,
      message: result.error,
    });
  }

  return res.status(200).send({
    statusCode: 200,
    message: result.message,
    token: result.token,
  });
};

const login = async (req, res) => {
  const { error, value: User } = LoginSchema.validate(req.body);

  if (error) {
    return res.status(400).send({
      statusCode: 400,
      message: error.details[0].message,
    });
  }

  const result = await UserService.Login(User);

  if (result.error) {
    return res.status(400).send({
      statusCode: 400,
      message: result.error,
    });
  }

  return res.code(200).send({
    statusCode: 200,
    message: result.message,
    token: result.token,
  });
};

emailVerify = async (req, res) => {
  const emailVerificationCode = req.query.code;

  if (!emailVerificationCode) {
    return res.status(400).send({
      statusCode: 400,
      message: "Code is required.",
    });
  }

  const [userId] = emailVerificationCode.split(":");

  if (!userId) {
    return res.status(400).send({
      statusCode: 400,
      message: "Code is invalid.",
    });
  }

  const result = await UserService.VerifyEmail(userId, emailVerificationCode);

  if (result.error) {
    return res.status(400).send({
      statusCode: 400,
      message: result.error,
    });
  }

  return res.status(200).send({
    statusCode: 200,
    message: result.message,
  });
};

resetPassword = async (req, res) => {
  const { error, value } = PasswordResetValidateSchema.validate({
    token: req.query.token,
    password: req.body.password,
  });

  if (error) {
    return res.status(400).send({
      statusCode: 400,
      message: error.details[0].message,
    });
  }

  const [userId] = value.token.split(":");

  if (!userId || !value.token) {
    return res.status(400).send({
      statusCode: 400,
      message: "Token is invalid.",
    });
  }

  const result = await UserService.ResetPassword({
    userId,
    password: value.password,
    token: value.token,
  });

  if (result.error) {
    return res.status(400).send({
      statusCode: 400,
      message: result.error,
    });
  }

  return res.status(200).send({
    statusCode: 200,
    message: result.message,
  });
};

sendPasswordResetEmail = async (req, res) => {
  const { error, value } = PasswordResetSchema.validate(req.query);

  if (error) {
    return res.status(400).send({
      statusCode: 400,
      message: error.details[0].message,
    });
  }

  const result = await UserService.SendPasswordResetEmail(value.email);

  if (result.error) {
    return res.status(400).send({
      statusCode: 400,
      message: result.error,
    });
  }

  return res.status(200).send({
    statusCode: 200,
    message: result.message,
  });
};

sendVerificationEmail = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).send({
      statusCode: 400,
      message: "Email is required.",
    });
  }

  const User = await UserService.getUser(
    { email },
    "email username emailVerified"
  );

  if (!User) {
    return res.status(400).send({
      statusCode: 400,
      message: "Email verification failed.",
    });
  }

  if (User.emailVerified) {
    return res.status(400).send({
      statusCode: 400,
      message: "Email already verified.",
    });
  }

  await UserService.SendVerificationEmail({
    _id: User._id,
    email: User.email,
    username: User.username,
  });

  return res.status(200).send({
    statusCode: 200,
    message: "Verification email sent.",
  });
};

// Export the routes
module.exports = {
  register,
  login,
  emailVerify,
  sendVerificationEmail,
  resetPassword,
  sendPasswordResetEmail,
};
