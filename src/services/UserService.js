const ObjectId = require("mongoose").Types.ObjectId;
const { randomBytes } = require("crypto");
const createToken = require("../utils/createToken.js");
const userModel = require("../models/user");

const RedisService = require("./RedisService");
const EmailService = require("./EmailService");

class UserService {
  constructor({ RedisService, userModel }) {
    this.client = RedisService.init();
    this.userModel = userModel;
  }

  async Signup(user) {
    try {
      const userRecord = await this.userModel.create(user);
      await this.createEmailVerificationCode(userRecord);

      return { token: createToken(userRecord) };
    } catch (err) {
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

    const correctCode = await this.getEmailVerificationCode(userId);

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

  generateEmailVerificationCode(userId) {
    return `${userId}:${randomBytes(128).toString("hex")}`;
  }

  async createEmailVerificationCode({ _id: userId, email, username }) {
    const code = this.generateEmailVerificationCode(userId);
    EmailService.sendVerificationEmail(email, username, code);

    return await this.client.set(
      `emailVerificationCode:${userId}`,
      code,
      "EX",
      60 * 60 * 24
    );
  }

  getEmailVerificationCode(userId) {
    return new Promise((resolve, reject) => {
      this.client.get(`emailVerificationCode:${userId}`, (err, result) => {
        if (err) {
          return reject(err);
        }

        resolve(result);
      });
    });
  }

  async findById(userId, selectFields) {
    return await this.userModel.findById(userId, selectFields);
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
