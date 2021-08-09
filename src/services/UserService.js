const ObjectId = require("mongoose").Types.ObjectId;
const { randomBytes } = require("crypto");
const createToken = require("../utils/createToken.js");
const userModel = require("../models/user");
const logger = require("../helpers/logger");

const RedisService = require("./RedisService");
const MailService = require("./MailService");

class UserService {
  constructor({ RedisService, userModel }) {
    this.client = RedisService.init();
    this.userModel = userModel;
  }

  async Register(user) {
    try {
      const User = await this.userModel.create(user);
      const token = createToken(User);
      await this.createEmailVerification(User, token);

      return {
        message: "Successfully signed up.",
        token,
      };
    } catch (err) {
      logger.error(`User signed up failed: ${err}`, { serivce: "User" });
      return { error: "User already exists." };
    }
  }

  async Login({ email, password }) {
    const userRecord = await this.userModel.findOne({ email });

    if (!userRecord) {
      return { error: "Login failed; Invalid email or password." };
    }

    const isMatch = userRecord.comparePassword(password);

    if (!isMatch) {
      return { error: "Login failed; Invalid email or password." };
    }

    return {
      message: "Successfully signed in.",
      token: createToken(userRecord),
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

    const correctCode = await this.getRedisToken(
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

  async ResetPassword({ userId, password, token }) {
    if (!this.isValidId(userId)) {
      return { error: "Your password could not be changed" };
    }

    const User = await this.userModel.findById(userId, "password");
    const correctToken = await this.getRedisToken("passwordResetCode", userId);

    if (!User || !correctToken || token !== correctToken) {
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

  async SendPasswordResetEmail(email) {
    const User = await this.userModel.findOne({ email }, "_id");

    if (User) {
      const token = `${User._id}:${randomBytes(32).toString("hex")}`;

      await MailService.sendMail("resetPassword", {
        email,
        passwordResetCode: token,
      });

      await this.client.set(
        `passwordResetCode:${User._id}`,
        token,
        "EX",
        60 * 60 * 24
      );

      return { message: "Password reset email sent." };
    }

    return { error: "Password reset email failed." };
  }

  async createEmailVerification(user, token) {
    await MailService.sendMail("registration", {
      email: user.email,
      username: user.username,
      emailVerificationCode: token,
    });

    return await this.client.set(
      `emailVerificationCode:${user._id}`,
      token,
      "EX",
      60 * 60 * 24
    );
  }

  getUser(userId, selectFileds) {
    if (this.isValidId(userId)) {
      return this.userModel.findById(userId, selectFileds);
    }

    return null;
  }

  getRedisToken(folderName, userId) {
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
}

const Dependencies = {
  RedisService,
  userModel,
};

module.exports = new UserService(Dependencies);
