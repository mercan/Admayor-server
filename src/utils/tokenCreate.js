const config = require("../config/index");
const jwt = require("jsonwebtoken");

module.exports = ({ _id: id, email, username, userType }) =>
  jwt.sign(
    {
      id,
      email,
      username,
      userType,
    },
    config.jwtSecretKey,
    {
      algorithm: config.jwtAlgorithm,
      expiresIn: config.jwtExpiresIn,
    }
  );
