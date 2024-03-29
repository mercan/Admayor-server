const UserService = require("../../services/UserService");
const unavailableEmails = require("../../utils/unavailableEmail.json");

// User Validation
const {
  RegisterSchema,
  LoginSchema,
  ResetPasswordSchema,
  ChangePasswordSchema,
  ChangeEmailSchema,
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

  if (unavailableEmails.includes(User.email.split("@")[1])) {
    return res.status(400).send({
      statusCode: 400,
      message: "Email domain is not allowed please use a different email.",
    });
  }

  const userAgent = req.headers["user-agent"];
  const ipAddress = req.ip || req.ips[0];
  const result = await UserService.register(User, userAgent, ipAddress);

  if (!result) {
    return res.status(409).send({
      statusCode: 409,
      message: "User already exists.",
    });
  }

  return res.status(200).send({
    statusCode: 200,
    message: "User created successfully.",
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

  const userAgent = req.headers["user-agent"];
  const ipAddress = req.ip || req.ips[0];
  const result = await UserService.login(User, userAgent, ipAddress);

  if (!result) {
    return res.status(400).send({
      statusCode: 400,
      message: "Login failed; Invalid email or password",
    });
  }

  return res.status(200).send({
    statusCode: 200,
    message: "Login successful.",
    token: result.token,
  });
};

const emailVerify = async (req, res) => {
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

  const result = await UserService.verifyEmail(userId, emailVerificationCode);

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

const resetPassword = async (req, res) => {
  const { error, value } = PasswordResetValidateSchema.validate({
    code: req.query.code,
    password: req.body.password,
  });

  if (error) {
    return res.status(400).send({
      statusCode: 400,
      message: error.details[0].message,
    });
  }

  const [userId] = value.code.split(":");

  if (!userId || !value.code) {
    return res.status(400).send({
      statusCode: 400,
      message: "Code is invalid.",
    });
  }

  const result = await UserService.resetPassword({
    userId,
    password: value.password,
    code: value.code,
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

const changePassword = async (req, res) => {
  const { error, value: User } = ChangePasswordSchema.validate(req.body);

  if (error) {
    return res.status(400).send({
      statusCode: 400,
      message: error.details[0].message,
    });
  }

  const result = await UserService.changePassword(
    req.user.id,
    User.password,
    User.newPassword
  );

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

const changeEmail = async (req, res) => {
  const { error, value: User } = ChangeEmailSchema.validate(req.query);

  if (error) {
    return res.status(400).send({
      statusCode: 400,
      message: error.details[0].message,
    });
  }

  const result = await UserService.changeEmail(req.user.id, User.email);

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

const sendResetPasswordEmail = async (req, res) => {
  const { error, value } = ResetPasswordSchema.validate(req.query);

  if (error) {
    return res.status(400).send({
      statusCode: 400,
      message: error.details[0].message,
    });
  }

  const result = await UserService.sendResetPasswordEmail(value.email);

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

const sendVerificationEmail = async (req, res) => {
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

  await UserService.sendVerificationEmail({
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
  sendResetPasswordEmail,
  changePassword,
  changeEmail,
};
