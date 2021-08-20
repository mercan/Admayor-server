const ObjectId = require("mongoose").Types.ObjectId;
const userAgentParser = require("ua-parser-js");
const { randomBytes, randomInt } = require("crypto");
const createToken = require("../utils/createToken");
const userModel = require("../models/user");
const got = require("got");

const RedisService = require("./RedisService");
const MailService = require("./MailService");
const WalletService = require("./WalletService");

class UserService {
  constructor({ RedisService, userModel }) {
    this.client = RedisService.init();
    this.userModel = userModel;
  }

  async Register(user, userAgent, ipAddress) {
    const userRecord = await this.userModel.findOne(
      {
        $or: [{ email: user.email }, { username: user.username }],
      },
      "_id"
    );

    if (userRecord) {
      return { error: "User already exists." };
    }

    let referenceCode;
    while (true) {
      referenceCode = randomInt(10000000, 99999999);
      const referenceCodeCheck = await userModel.findOne(
        { referenceCode },
        "_id"
      );

      if (!referenceCodeCheck) {
        break;
      }
    }

    const userAgentData = { userAgent: userAgentParser(userAgent) };
    const location = await this.getLocation(ipAddress);

    user.country = location?.country; // location && locatin.country;
    user.referenceCode = referenceCode;
    const User = await this.userModel.create(user);
    const token = createToken(User);

    await User.updateLastLogin();
    await this.SendVerificationEmail(User);
    await this.createLoginInfo(User._id, { ...userAgentData, ...location });

    if (
      user.registerReferenceCode &&
      String(user.registerReferenceCode).length === 8 &&
      Number.isInteger(Number(user.registerReferenceCode))
    ) {
      await this.userModel.updateOne(
        { referenceCode: user.registerReferenceCode },
        {
          $push: {
            references: {
              userId: User._id,
            },
          },
        }
      );
    }

    return {
      message: "Successfully signed up.",
      token,
    };
  }

  async Login(user, userAgent, ipAddress) {
    const User = await this.userModel.findOne({ email: user.email });

    if (!User) {
      return { error: "Login failed; Invalid email or password." };
    }

    const isMatch = User.comparePassword(user.password);

    if (!isMatch) {
      return { error: "Login failed; Invalid email or password." };
    }

    const userAgentData = { userAgent: userAgentParser(userAgent) };
    const location = await this.getLocation(ipAddress);
    await User.updateLastLogin();
    await this.createLoginInfo(User._id, { ...userAgentData, ...location });

    return {
      message: "Successfully signed in.",
      token: createToken(User),
    };
  }

  async VerifyEmail(userId, emailVerificationCode) {
    if (!this.isValidId(userId)) {
      return { error: "Email verification failed." };
    }

    const User = await this.userModel.findById(
      { _id: userId },
      "emailVerified"
    );

    const correctCode = await this.getRedisCode(
      "emailVerificationCode",
      userId
    );

    if (
      !User ||
      User.emailVerified ||
      !correctCode ||
      emailVerificationCode !== correctCode
    ) {
      return { error: "Email verification failed." };
    }

    await this.client.del(`emailVerificationCode:${userId}`);
    await this.userModel.updateOne(
      { _id: userId },
      { $set: { emailVerified: true } }
    );

    return { message: "Email verified successfully." };
  }

  async ResetPassword({ userId, password, code }) {
    if (!this.isValidId(userId)) {
      return { error: "Your password could not be changed" };
    }

    const User = await this.userModel.findById(userId, "password");
    const correctCode = await this.getRedisCode("passwordResetCode", userId);

    if (!User || !correctCode || code !== correctCode) {
      return { error: "Your password could not be changed." };
    }

    const isMatch = User.comparePassword(password);

    if (isMatch) {
      return {
        error: "The new password cannot be the same as the old password.",
      };
    }

    await this.client.del(`passwordResetCode:${userId}`);
    await User.resetPassword(password);

    return { message: "Your password has been changed." };
  }

  async ChangePassword(userId, password, newPassword) {
    if (!this.isValidId(userId)) {
      return { error: "Your password could not be changed." };
    }

    const User = await this.userModel.findById(userId, "password");
    const isMatch = User.comparePassword(password);

    if (!isMatch) {
      return { error: "Your password could not be changed." };
    }

    if (User.comparePassword(newPassword)) {
      return {
        error: "The new password cannot be the same as the old password.",
      };
    }

    await User.resetPassword(newPassword);
    return { message: "Your password has been changed." };
  }

  async SendResetPasswordEmail(email) {
    const User = await this.userModel.findOne({ email }, "_id");

    if (User) {
      const code = `${User._id}:${randomBytes(32).toString("hex")}`;

      await MailService.sendMail("resetPassword", {
        email,
        passwordResetCode: code,
      });

      await this.client.set(
        `passwordResetCode:${User._id}`,
        code,
        "EX",
        60 * 60 * 24
      );

      return { message: "Password reset email sent." };
    }

    return { error: "Password reset email failed." };
  }

  async SendVerificationEmail(user) {
    const randomCode = randomBytes(124).toString("hex");
    const code = `${user._id}:${randomCode}`;

    await MailService.sendMail("registration", {
      email: user.email,
      username: user.username,
      emailVerificationCode: code,
    });

    return await this.client.set(
      `emailVerificationCode:${user._id}`,
      code,
      "EX",
      60 * 60 * 24
    );
  }

  async getUser(userIdOrField, selectFileds) {
    if (this.isValidId(userIdOrField)) {
      return this.userModel.findById(userIdOrField, selectFileds);
    } else {
      return this.userModel.findOne(userIdOrField, selectFileds);
    }
  }

  async getLocation(ipAddress) {
    const URL = `http://ip-api.com/json/${ipAddress}?fields=status,country,city`;
    const { body } = await got.get(URL, {
      headers: { "Content-Type": "application/json" },
      responseType: "json",
    });

    return body.status === "success" ? body : null;
  }

  async createLoginInfo(userId, loginInfo) {
    await this.userModel.updateOne(
      { _id: userId },
      {
        $push: {
          loginInfo,
        },
      }
    );
  }

  getRedisCode(folderName, userId) {
    return new Promise((resolve, reject) => {
      this.client.get(`${folderName}:${userId}`, (err, result) => {
        if (err) {
          return reject(err);
        }

        resolve(result);
      });
    });
  }

  isValidId(userId) {
    return ObjectId.isValid(userId);
  }

  // Wallet Service
  async createWallet(userId) {
    const User = await this.userModel.findById(userId, "wallet");

    if (!User) {
      return { error: "User not found." };
    }

    if (User.wallet?.address) {
      return { error: "Address already exists." };
    }

    const wallet = WalletService.createWallet(userId);
    const walletCheck = await this.userModel.findOne(
      {
        "wallet.address": wallet.address,
      },
      "_id"
    );

    if (walletCheck) {
      return createWallet(userId);
    }

    await this.userModel.updateOne({ _id: userId }, { $set: { wallet } });

    return {
      message: "Wallet created successfully.",
      address: wallet.address,
    };
  }

  async saveBTCAddress(userId, address) {
    if (!WalletService.isValidAddress(address)) {
      return { error: "Invalid bitcoin address." };
    }

    const User = await this.userModel.findById(userId, "bitcoinAddress");

    if (!User) {
      return { error: "User not found." };
    }

    if (User.bitcoinAddress === address) {
      return { message: "Bitcoin address saved." };
    }

    User.bitcoinAddress = address;
    await User.save();

    return { message: "Bitcoin address saved." };
  }
}

const Dependencies = {
  RedisService,
  userModel,
};

module.exports = new UserService(Dependencies);
