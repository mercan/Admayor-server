const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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

const Advertising = new Schema(
  {
    title: {
      type: String,
      required: true,
      maxLength: 100,
      minLength: 3,
      trim: true,
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

    type: {
      type: String,
      required: true,
      lowwercase: true,
      enum: ["surf", "autosurf", "window", "video"],
    },

    duration: {
      type: String,
      required: true,
      enum: ["15", "30", "45", "60", "120", "240"],
    },

    totalClicks: {
      type: Number,
      required: true,
      min: 100,
    },

    dailyClicks: {
      type: Number,
      required: true,
    },

    todayClicks: {
      type: Number,
      default: 0,
    },

    geoTargets: [
      {
        type: String,
        enum: countries,
        required: true,
      },
    ],

    // userQualityTarget: {
    //   type: Number,
    //   required: true,
    //   default: 0,
    //   min: 0,
    // },

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
  {
    timestamps: true,
    versionKey: false,
  }
);

// Static Methods

// Istance methods

const advertisingModel = mongoose.model("Advertising", Advertising);
module.exports = advertisingModel;
