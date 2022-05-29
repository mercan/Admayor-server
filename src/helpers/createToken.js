const config = require("../config/index");
const jwt = require("jsonwebtoken");

module.exports = ({ _id: userId, email, username, role }) =>
  jwt.sign(
    {
      userId,
      email,
      username,
      role,
    },
    config.JWT.secretKey,
    {
      algorithm: config.JWT.algorithm,
      expiresIn: config.JWT.expiresIn,
    }
  );
