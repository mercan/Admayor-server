const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;
const createToken = require("../helpers/createToken");

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

    country: String,

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

    bitcoinAddress: String,
    bitcoinAddressCreatedAt: Date,

    wallet: {
      address: String,
      privateKey: String,
      createdAt: Date,
    },

    referenceCode: {
      type: String,
      ref: "User",
      minLength: 4,
      maxLength: 16,
      required: true,
      lowercase: true,
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
        city: String,
        country: String,
        userAgent: {
          browser: {
            name: String,
            version: String,
          },
          os: {
            name: String,
            version: String,
          },
          device: {
            vendor: String,
            model: String,
            type: String,
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

    lastLoginAt: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Static Methods
// User.statics.passwordUpdate = async function (userId, plainPassword) {
//   const password = bcrypt.hashSync(plainPassword, 10);

//   return await userModel.updateOne(
//     { _id: userId },
//     {
//       $set: {
//         password,
//       },
//     }
//   );
// };

// Istance methods
User.methods.updatePassword = function (plainPassword) {
  const password = bcrypt.hashSync(plainPassword, 10);

  return this.updateOne({
    $set: {
      password,
    },
  });
};

User.methods.updateEmail = function (email) {
  return this.updateOne({
    $set: {
      email,
      emailVerified: false,
    },
  });
};

User.methods.comparePassword = function (plainPassword) {
  return bcrypt.compareSync(plainPassword, this.password);
};

User.methods.generateAuthToken = function () {
  const token = createToken(this);

  return token;
};

User.methods.updateLastLogin = function () {
  return this.updateOne({
    $set: {
      lastLoginAt: Date.now(),
    },
  });
};

User.pre("save", function (next) {
  if (this.isModified("password")) {
    this.password = bcrypt.hashSync(this.password, 10);
  }

  next();
});

User.index({ "wallet.address": 1 });
User.index({ emailVerified: 1 });
User.index({ role: 1 });

const userModel = mongoose.model("User", User);
module.exports = userModel;
