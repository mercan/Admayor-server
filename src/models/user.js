const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const User = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      maxLength: 100,
    },

    username: {
      type: String,
      unique: true,
      required: true,
      minLength: 4,
      maxLength: 16,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      minLength: 6,
      maxLength: 100,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    balance: {
      type: Number,
      default: 0,
    },

    advertisingBalance: {
      type: Number,
      default: 0,
    },

    bitcoinAddress: {
      type: String,
      default: "",
    },

    wallet: {
      address: {
        type: String,
        unique: true,
      },

      privateKey: {
        type: String,
      },

      createdAt: {
        type: Date,
      },
    },

    lastLogin: {
      type: Date,
    },

    displayedAdIds: [
      {
        _id: false,
        id: {
          type: Schema.Types.ObjectId,
          ref: "Advertising",
          unique: true,
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
User.statics.passwordUpdate = async function (userId, plainPassword) {
  const password = bcrypt.hashSync(plainPassword, 10);

  return await userModel.updateOne(
    { _id: userId },
    {
      $set: {
        password,
      },
    }
  );
};

// Istance methods
User.methods.resetPassword = function (plainPassword) {
  const password = bcrypt.hashSync(plainPassword, 10);

  return this.updateOne({
    $set: {
      password,
    },
  });
};

User.methods.comparePassword = function (plainPassword) {
  return bcrypt.compareSync(plainPassword, this.password);
};

User.methods.updateLastLogin = function () {
  return this.updateOne({
    $set: {
      lastLogin: Date.now(),
    },
  });
};

User.pre("save", function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = bcrypt.hashSync(this.password, 10);
  next();
});

User.index({ email: 1, username: 1 });

const userModel = mongoose.model("User", User);
module.exports = userModel;
