const UserService = require("../../services/user");
// User Validation
const { SignupSchema, SignInSchema } = require("../../validation/user.schema");

const signup = async (req, res) => {
  const validation = SignupSchema.validate(req.body);

  if (validation.error) {
    return res.status(400).json({
      statusCode: 400,
      message: validation.error.details[0].message,
    });
  }

  const userDTO = validation.value;
  const { errorCode, token } = await UserService.Signup(userDTO);

  if (errorCode === 11000) {
    return res.status(409).send({
      statusCode: 409,
      message: "User already exists",
    });
  }

  return res.status(200).send({
    statusCode: 200,
    message: "Successfully signed up",
    token,
  });
};

const signIn = async (req, res) => {
  const validation = SignInSchema.validate(req.body);

  if (validation.error) {
    return res.status(400).send({
      statusCode: 400,
      message: validation.error.details[0].message,
    });
  }

  const userDTO = validation.value;
  const { token } = await UserService.SignIn(userDTO);

  if (!token) {
    return res.status(400).send({
      statusCode: 400,
      message: "Login failed; Invalid email or password.",
    });
  }

  return res.code(200).send({
    statusCode: 200,
    message: "Successfully signed in",
    token,
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

module.exports = { signup, signIn, emailVerify };
