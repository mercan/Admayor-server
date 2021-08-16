const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Report = new Schema(
  {
    adId: {
      type: Schema.Types.ObjectId,
      ref: "Advertising",
      required: true,
      unique: true,
    },

    adType: {
      type: String,
      required: true,
      enum: ["surf", "autosurf", "window", "video"],
    },

    reports: [
      {
        _id: false,

        userId: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: "User",
        },

        message: {
          type: String,
          required: true,
          minLength: 1,
          maxLength: 500,
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const reportModel = mongoose.model("Report", Report);
module.exports = reportModel;
