const Joi = require("joi");

const countries = [
  "Turkey",
  "Russia",
  "United States",
  "England",
  "Ukraine",
  "India",
  "Germany",
  "Indonesia",
  "Philippines",
  "Brazil",
  "China",
  "France",
  "Italy",
  "Spain",
  "Norway",
  "Canada",
  "Sweden",
  "Australia",
  "Argentina",
  "Belgium",
];

const options = {
  stripUnknown: true,
  convert: true,
  allowUnknown: false,
};

const AdvertisingSchema = Joi.object()
  .keys({
    title: Joi.string().required().messages({
      "string.empty": "Title is required",
      "any.required": "Title is required",
    }),

    description: Joi.string().required().messages({
      "string.empty": "Description is required",
      "any.required": "Description is required",
    }),

    url: Joi.string().required().messages({
      "string.empty": "URL is required",
      "any.required": "URL is required",
    }),

    type: Joi.string()
      .required()
      .lowercase()
      .valid("surf", "autosurf", "window", "video", "job", "poll")
      .messages({
        "string.empty": "Type is required",
        "any.required": "Type is required",
        "any.only":
          "Type must be one of: surf, autosurf, window, video, job, poll",
      }),

    duration: Joi.string()
      .required()
      .valid(...["10", "15", "30", "45", "60", "120"])
      .messages({
        "string.empty": "Duration is required",
        "any.required": "Duration is required",
        "any.only": "Duration must be one of: 10, 15, 30, 45, 60, 120",
      }),

    totalClicks: Joi.number().integer().min(100).required().messages({
      "number.required": "Total Click is required",
      "number.min": "Total Click must be at least 100",
      "number.integer": "Total Click must be an integer",
    }),

    dailyClicks: Joi.number().integer().required().messages({
      "number.required": "Daily Click is required",
      "number.integer": "Daily Click must be an integer",
    }),

    geoTargets: Joi.array().items(
      Joi.string()
        .required()
        .valid(...countries)
        .messages({
          "any.required": "Geo Targets is required",
          "any.only": "Geo targets are not valid",
        })
    ),

    isAdult: Joi.boolean().required().messages({
      "boolean.required": "Is Adult is required",
      "boolean.invalid": "Is Adult must be a boolean",
    }),
  })
  .required()
  .options(options)
  .messages({
    "object.base": "Please fill out all required fields.",
  });

module.exports = { AdvertisingSchema };
