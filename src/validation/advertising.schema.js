const Joi = require("joi");

const countryAndCode = require("../utils/countries.json");
const countries = countryAndCode.map(({ name }) => name);
const languages = require("../utils/languages.json");

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

    totalBudget: Joi.number().integer().required().messages({
      "number.required": "Total Budget is required",
      "number.integer": "Total Budget must be an integer",
    }),

    dailyBudget: Joi.number().integer().required().messages({
      "number.required": "Daily Budget is required",
      "number.integer": "Daily Budget must be an integer",
    }),

    startedAt: Joi.date().required().messages({
      "date.required": "Started At is required",
      "date.base": "Started At must be a valid date",
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

    languageTargets: Joi.array().items(
      Joi.string()
        .required()
        .valid(...languages)
        .messages({
          "any.required": "Language Targets is required",
          "any.only": "Language Targets is not valid",
        })
    ),

    userQualityTarget: Joi.number().integer().required().messages({
      "number.required": "User Quality Target is required",
      "number.integer": "User Quality Target must be an integer",
    }),

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
