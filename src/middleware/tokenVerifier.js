const config = require("../config/index");
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const bearerHeader = req.headers["authorization"];

  if (!bearerHeader) {
    return res.status(403).send({
      statusCode: 403,
      message: "Missing authorization header!",
    });
  }

  const bearerToken = bearerHeader.split(" ")[1];
  req.token = bearerToken;

  try {
    const decode = jwt.verify(bearerToken, config.JWT.secretKey);

    decode.id = decode.userId;
    req.user = decode;
  } catch {
    return res.status(401).send({
      statusCode: 401,
      message: "Unauthorized!",
    });
  }

  next();
};
