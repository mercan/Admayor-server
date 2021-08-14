const advertisingModel = require("../../models/advertising");
const UserService = require("../../services/UserService");
const { AdvertisingSchema } = require("../../validation/advertising.schema");

const crateSurfOrAutosurfAd = (advertising) => {
  if (!["15", "30", "45", "60"].includes(advertising.duration)) {
    return {
      statusCode: 400,
      message: "Invalid duration",
    };
  }

  // Kaydetme işlemi yapılacak
};

// http://youtube.com/watch?v=BeFT1hcpUPo
// https://youtu.be/watch?v=BeFT1hcpUPo
// https://youtu.be/BeFT1hcpUPo
const createVideoAd = (advertising) => {
  const youtube = new URL(advertising.url);

  if (
    !["30", "45", "60", "120", "240"].includes(advertising.duration) ||
    (youtube.hostname !== "youtu.be" && youtube.hostname !== "youtube.com")
  ) {
    return {
      statusCode: 400,
      message: "Invalid duration",
    };
  }

  const videoId = youtube.searchParams.get("v") ?? youtube.pathname.slice(1);

  if (!videoId || !videoId.match(/^[a-zA-Z0-9_-]{11}$/)) {
    return {
      statusCode: 400,
      message: "Invalid url",
    };
  }

  // Kaydetme işlemi yapılacak
};

const createAdvertising = async (req, res) => {
  if (!req.body.geoTargets) {
    return res.status(400).send({
      statusCode: 400,
      message: "Missing geoTargets",
    });
  } else {
    req.body.geoTargets = req.body.geoTargets.split(",");
  }

  if (!req.body.languageTargets) {
    return res.status(400).send({
      statusCode: 400,
      message: "Missing languageTargets",
    });
  } else {
    req.body.languageTargets = req.body.languageTargets.split(",");
  }

  const { error, value } = AdvertisingSchema.validate(req.body);

  if (error) {
    return res.status(400).send({
      statusCode: 400,
      message: error.details[0].message,
    });
  }

  const userRecord = await UserService.getUser(req.user.id, "_id");

  if (!userRecord) {
    return res.status(400).send({
      statusCode: 400,
      message: "Failed to create ad.",
    });
  }

  value.userId = userRecord._id;

  if (value.type === "surf" || value.type === "autosurf") {
    const result = crateSurfOrAutosurfAd(value);
    return res.status(result.statusCode).send(result);
  }

  if (value.type === "video") {
    const result = createVideoAd(value);
    return res.status(result.statusCode).send(result);
  }

  return res.status(400).send({
    statusCode: 400,
    message: "Invalid ad type",
  });

  value.configurations = {
    type: value.type,
    duration: value.duration,
    totalBudget: value.totalBudget,
    dailyBudget: value.dailyBudget,
    startedAt: value.startedAt,
    endedAt: value.endedAt,
    frequency: value.frequency,
    geoTargets: value.geoTargets,
    languageTargets: value.languageTargets,
    userQualityTarget: value.userQualityTarget,
    isAdult: value.isAdult,
  };

  await advertisingModel.create(value);

  return res.status(200).send({ statusCode: 200, advertising: value });
};

// Export the routes
module.exports = {
  createAdvertising,
};
