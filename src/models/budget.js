const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Budget = new Schema(
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

    budgets: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        earnedBudget: {
          type: Number,
          required: true,
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

const budgetModel = mongoose.model("Budget", Budget);
module.exports = budgetModel;
