const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const countryAndCode = require("../utils/countries.json");
const countries = countryAndCode.map(({ name }) => name);
const languages = require("../utils/languages.json");

const Advertising = new Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    url: {
      type: String,
      required: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    configurations: [
      {
        type: {
          type: String,
          required: true,
          lowwercase: true,
          enum: ["surf", "autosurf", "window", "video"],
        },

        duration: {
          type: String,
          required: true,
          enum: ["0", "10", "15", "30", "45", "60", "120", "240"],
        },

        totalBudget: {
          type: Number,
          required: true,
        },

        dailyBudget: {
          type: Number,
          required: true,
        },

        startedAt: {
          type: Date,
          required: true,
        },

        endedAt: {
          type: Date,
          required: true,
        },

        geoTargets: {
          type: [{ type: String, enum: countries, required: true }],
        },

        languageTargets: {
          type: [{ type: String, enum: languages, required: true }],
        },

        userQualityTarget: {
          type: Number,
          required: true,
          default: 0,
          min: 0,
        },

        isAdult: {
          type: Boolean,
          required: true,
        },

        isApproved: {
          type: Boolean,
          default: false,
        },

        isActive: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Static Methods

// Istance methods

const advertisingModel = mongoose.model("advertising", Advertising);
module.exports = advertisingModel;
