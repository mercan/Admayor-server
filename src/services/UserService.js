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

  async Signup(user) {
    try {
      const userRecord = await this.userModel.create(user);
      const token = createToken(userRecord);
      await this.createEmailVerificationCode(userRecord, token);

      return { token };
    } catch (err) {
      logger.error(`User signed up failed: ${err}`, { serivce: "User" });
      return { errorCode: err.code || err };
    }
  }

  async SignIn({ email, password }) {
    const userRecord = await this.userModel.findOne({ email });

    if (!userRecord) {
      return false;
    }

    const isMatch = userRecord.comparePassword(password);

    if (!isMatch) {
      return false;
    }

    return { token: createToken(userRecord) };
  }

  async VerifyEmail(userId, emailVerificationCode) {
    if (!this.isValidId(userId)) {
      return false;
    }

    const userRecord = await this.userModel.findById(
      { _id: userId },
      "emailVerified"
    );

    const correctCode = await this.getRedisToken(
      "emailVerificationCode",
      userId
    );

    if (
      !userRecord ||
      userRecord.emailVerified ||
      !correctCode ||
      emailVerificationCode !== correctCode
    ) {
      return false;
    }

    await this.client.del(`emailVerificationCode:${userId}`);
    return await this.userModel.updateOne(
      { _id: userId },
      { $set: { emailVerified: true } }
    );
  }

  async ResetPassword({ userId, password, token }) {
    if (!this.isValidId(userId)) {
      return false;
    }

    const userRecord = await this.userModel.findById(userId, "password");
    const correctToken = await this.getRedisToken("passwordResetCode", userId);

    if (!userRecord || !correctToken || token !== correctToken) {
      return false;
    }

    const isMatch = userRecord.comparePassword(password);

    if (isMatch) {
      return {
        message: "The new password cannot be the same as the old password.",
      };
    }

    await this.client.del(`passwordResetCode:${userId}`);
    return await this.userModel.passwordUpdate(userId, password);
  }

  async SendPasswordResetEmail(email) {
    const userRecord = await this.userModel.findOne({ email });

    if (!userRecord) {
      return false;
    }

    return await this.createPasswordResetCode(userRecord);
  }

  async createPasswordResetCode({ _id: userId, email }) {
    const token = `${userId}:${randomBytes(32).toString("hex")}`;

    MailService.sendMail("resetPassword", {
      email,
      passwordResetCode: token,
    });

    return await this.client.set(
      `passwordResetCode:${userId}`,
      token,
      "EX",
      60 * 60 * 24
    );
  }

  async createEmailVerificationCode({ _id: userId, email, username }, token) {
    MailService.sendMail("registration", {
      email,
      username,
      emailVerificationCode: token,
    });

    return await this.client.set(
      `emailVerificationCode:${userId}`,
      token,
      "EX",
      60 * 60 * 24
    );
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
