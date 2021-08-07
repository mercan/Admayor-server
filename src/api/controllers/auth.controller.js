const UserService = require("../../services/UserService");
// User Validation
const {
  SignupSchema,
  SignInSchema,
  PasswordResetSchema,
  PasswordResetValidateSchema,
} = require("../../validation/user.schema");
const unavailableUsernames = require("../../utils/unavailableUsername.json");
const verifyToken = require("../../utils/verifyToken");

const signup = async (req, res) => {
  const { error, value: userDTO } = SignupSchema.validate(req.body);

  if (error) {
    return res.status(400).send({
      statusCode: 400,
      message: error.details[0].message,
    });
  }

  if (unavailableUsernames.includes(userDTO.username)) {
    return res.status(400).send({
      statusCode: 400,
      message: "Username is not available.",
    });
  }

  const { errorCode, token } = await UserService.Signup(userDTO);

  if (errorCode === 11000) {
    return res.status(409).send({
      statusCode: 409,
      message: "User already exists.",
    });
  }

  return res.status(200).send({
    statusCode: 200,
    message: "Successfully signed up.",
    token,
  });
};

const signIn = async (req, res) => {
  const { error, value: userDTO } = SignInSchema.validate(req.body);

  if (error) {
    return res.status(400).send({
      statusCode: 400,
      message: error.details[0].message,
    });
  }

  const { token } = await UserService.SignIn(userDTO);

  if (!token) {
    return res.status(400).send({
      statusCode: 400,
      message: "Login failed; Invalid email or password.",
    });
  }

  return res.code(200).send({
    statusCode: 200,
    message: "Successfully signed in.",
    token,
  });
};

emailVerify = async (req, res) => {
  if (!req.query.token) {
    return res.status(400).send({
      statusCode: 400,
      message: "Token is required.",
    });
  }

  const user = verifyToken(req.query.token);

  if (!user) {
    return res.status(400).send({
      statusCode: 400,
      message: "Token is invalid.",
    });
  }

  const result = await UserService.VerifyEmail(user.id, req.query.token);

  if (!result) {
    return res.status(400).send({
      statusCode: 400,
      message: "Email verification failed.",
    });
  }

  return res.status(200).send({
    statusCode: 200,
    message: "Email verified successfully.",
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

  if (!result) {
    return res.status(400).send({
      statusCode: 400,
      message: "Password reset email failed.",
    });
  }

  return res.status(200).send({
    statusCode: 200,
    message: "Password reset email sent.",
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

  if (!result) {
    return res.status(400).send({
      statusCode: 400,
      message: "Password reset failed.",
    });
  }

  if (result.message) {
    return res.status(400).send({
      statusCode: 400,
      message: result.message,
    });
  }

  return res.status(200).send({
    statusCode: 200,
    message: "Password reset successfully.",
  });
};

sendVerificationEmail = async (req, res) => {
  const userRecord = await UserService.findById(req.user.id, "emailVerified");

  if (!userRecord) {
    return res.status(400).send({
      statusCode: 400,
      message: "Email verification failed.",
    });
  }

  if (userRecord.emailVerified) {
    return res.status(400).send({
      statusCode: 400,
      message: "Email already verified.",
    });
  }

  await UserService.createEmailVerificationCode({
    _id: req.user.id,
    email: req.user.email,
    username: req.user.username,
  });

  return res.status(200).send({
    statusCode: 200,
    message: "Verification email sent.",
  });
};

// Export the routes
module.exports = {
  signup,
  signIn,
  emailVerify,
  sendVerificationEmail,
  resetPassword,
  sendPasswordResetEmail,
};
