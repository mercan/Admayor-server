module.exports = {
  global: false,
  errorResponseBuilder: function () {
    return {
      statusCode: 429,
      message: "Too Many Requests",
    };
  },
};
