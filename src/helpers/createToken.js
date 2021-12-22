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
    config.jwtSecretKey,
    {
      algorithm: config.jwtAlgorithm,
      expiresIn: config.jwtExpiresIn,
    }
  );
