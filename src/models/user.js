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

    country: {
      type: String,
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
  // Kullanıcı emaili değiştirildiğinde emailVerified değeri false olarak değiştirilir.
  if (this.isModified("email")) {
    this.emailVerified = false;
  }

  // Kullanıcı şifresini hashleyerek kaydetme
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
