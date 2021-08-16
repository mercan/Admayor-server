const ReportService = require("../../services/ReportService");

const createReport = async (req, res) => {
  const { adId, message } = req.query;

  if (!adId) {
    return res.status(400).send({
      statusCode: 400,
      message: "Ad ID is required.",
    });
  }

  if (!message) {
    return res.status(400).send({
      statusCode: 400,
      message: "Message is required.",
    });
  }

  const result = await ReportService.create({
    adId,
    message,
    userId: req.user.id,
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

module.exports = { createReport };
