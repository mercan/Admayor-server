const UserService = require("../../services/UserService");
// User Validation
const { SignupSchema, SignInSchema } = require("../../validation/user.schema");
const unavailableUsernames = require("../../utils/unavailableUsername.json");

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

emailVerify = async (req, res) => {
  if (!req.query.code) {
    return res.status(400).send({
      statusCode: 400,
      message: "Code is required.",
    });
  }

  const [userId, code] = req.query.code.split(":");

  if (!userId || !code) {
    return res.status(400).send({
      statusCode: 400,
      message: "Code is invalid.",
    });
  }

  const result = await UserService.VerifyEmail(userId, req.query.code);

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

// Export the routes
module.exports = { signup, signIn, sendVerificationEmail, emailVerify };
