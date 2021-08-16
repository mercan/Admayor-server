const ObjectId = require("mongoose").Types.ObjectId;
const userAgentParser = require("ua-parser-js");
const { randomBytes } = require("crypto");
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
    try {
      const UserRecord = await this.userModel.create(user);
      const token = createToken(UserRecord);
      await this.SendVerificationEmail(UserRecord);
      await UserRecord.updateLastLogin();
      await this.createLoginInfo(UserRecord._id, userAgent, ipAddress);

      return {
        message: "Successfully signed up.",
        token,
      };
    } catch {
      return { error: "User already exists." };
    }
  }

  async Login(user, userAgent, ipAddress) {
    const UserRecord = await this.userModel.findOne({ email: user.email });

    if (!UserRecord) {
      return { error: "Login failed; Invalid email or password." };
    }

    const isMatch = UserRecord.comparePassword(user.password);

    if (!isMatch) {
      return { error: "Login failed; Invalid email or password." };
    }

    await UserRecord.updateLastLogin();
    await this.createLoginInfo(UserRecord._id, userAgent, ipAddress);

    return {
      message: "Successfully signed in.",
      token: createToken(UserRecord),
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

  async createLoginInfo(userId, userAgent, ipAddress) {
    const ua = userAgentParser(userAgent);
    const url = `http://ip-api.com/json/${ipAddress}?fields=status,country,city`;
    const { body } = await got.get(url, {
      headers: { "Content-Type": "application/json" },
      responseType: "json",
    });
    const loginInfo = { ip: ipAddress, userAgent: ua };

    if (body.status === "success") {
      loginInfo.city = body.city;
      loginInfo.country = body.country;
    }

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
}

const Dependencies = {
  RedisService,
  userModel,
};

module.exports = new UserService(Dependencies);
