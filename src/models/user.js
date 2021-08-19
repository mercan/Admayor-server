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
      },
      privateKey: {
        type: String,
      },
      createdAt: {
        type: Date,
      },
    },

    referenceCode: {
      type: Number,
      unique: true,
      minLength: 8,
      maxLength: 8,
    },

    references: [
      {
        _id: false,
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    loginInfo: [
      {
        _id: false,
        ip: {
          type: String,
          required: true,
        },
        city: {
          type: String,
        },
        country: {
          type: String,
        },
        userAgent: {
          browser: {
            name: {
              type: String,
            },
            version: {
              type: String,
            },
          },
          os: {
            name: {
              type: String,
            },
            version: {
              type: String,
            },
          },
          device: {
            vendor: {
              type: String,
            },
            model: {
              type: String,
            },
            type: {
              type: String,
            },
          },
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    displayedAdIds: [
      {
        _id: false,
        adId: {
          type: Schema.Types.ObjectId,
          ref: "Advertising",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    lastLoginAt: {
      type: Date,
    },
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
      lastLoginAt: Date.now(),
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

User.index({ "wallet.address": 1 });

const userModel = mongoose.model("User", User);
module.exports = userModel;
