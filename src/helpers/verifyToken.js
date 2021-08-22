const config = require("../config/index");
const jwt = require("jsonwebtoken");

module.exports = (token) => {
  try {
    const decode = jwt.verify(token, config.jwtSecretKey);
    return decode;
  } catch {
    return false;
  }
};
