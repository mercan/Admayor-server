const ObjectId = require("mongoose").Types.ObjectId;
const userAgentParser = require("ua-parser-js");
const { randomBytes } = require("crypto");
const userModel = require("../models/user");
const got = require("got");

// Services
// const RabbitMQ = require("./RabbitMQ");
const RedisService = require("./RedisService");
const MailService = require("./MailService");
const WalletService = require("./WalletService");

class UserService {
  constructor({ userModel }) {
    this.userModel = userModel;

    // RabbitMQ kullanılmaya başlandığında kullanılacak
    // RabbitMQ Connection
    // RabbitMQ.connect();
  }

  async register(user, userAgent, ipAddress) {
    const userRecord = await this.userModel.findOne(
      {
        $or: [{ email: user.email }, { username: user.username }],
      },
      "_id"
    );

    if (userRecord) {
      return false;
    }

    const userAgentData = { userAgent: userAgentParser(userAgent) };
    let location = { location: await this.getLocation(ipAddress) };

    if (!location.location) {
      location = {
        location: {
          country: "Unknown",
          city: "Unknown",
        },
      };
    }

    location.ipAddress = ipAddress;
    user.country = location.location?.country ?? "Unknown"; // location && locatin.country;
    user.referenceCode = user.username;
    const User = await this.userModel.create(user);

    await User.updateLastLogin();
    await this.sendVerificationEmail(User);
    await this.createLoginInfo(User._id, {
      ...userAgentData,
      ...location,
    });

    if (
      user.registerReferenceCode &&
      user.registerReferenceCode.length >= 4 &&
      user.registerReferenceCode.length <= 16
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

    return { token: User.generateAuthToken() };
  }

  /**
   *
   * @param {object} user Email and Password object to login.
   * @param {string} userAgent userAgent of the user.
   * @param {string} ipAddress ipAddress of the user.
   * @returns {object} message and token object.
   */
  async login(user, userAgent, ipAddress) {
    const userRecord = await this.userModel.findOne({ email: user.email });

    if (!userRecord) {
      return false;
    }

    const isMatch = userRecord.comparePassword(user.password);

    if (!isMatch) {
      return false;
    }

    const userAgentData = { userAgent: userAgentParser(userAgent) };
    const location = await this.getLocation(ipAddress);
    await userRecord.updateLastLogin();
    await this.createLoginInfo(userRecord._id, {
      ...userAgentData,
      ...location,
    });

    return { token: userRecord.generateAuthToken() };
  }

  async verifyEmail(userId, emailVerificationCode) {
    if (!this.isValidId(userId)) {
      return { error: "Email verification failed" };
    }

    const userRecord = await this.userModel.findById(
      { _id: userId },
      "emailVerified"
    );

    if (userRecord.emailVerified) {
      return { error: "Email verification failed" };
    }

    const correctCode = await RedisService.getKey(
      "emailVerificationCode",
      userId
    );

    if (!userRecord || !correctCode || emailVerificationCode !== correctCode) {
      return { error: "Email verification failed" };
    }

    await RedisService.deleteKey("emailVerificationCode", userId);
    await this.userModel.updateOne(
      {
        _id: userId,
      },
      {
        $set: {
          emailVerified: true,
        },
      }
    );

    return { message: "Email verified successfully" };
  }

  async resetPassword({ userId, password, code }) {
    if (!this.isValidId(userId)) {
      return { error: "Your password could not be changed" };
    }

    const userRecord = await this.userModel.findById(userId, "password");
    const correctCode = await RedisService.getKey("resetPasswordCode", userId);

    if (!userRecord || !correctCode || code !== correctCode) {
      return { error: "Your password could not be changed" };
    }

    const isMatch = userRecord.comparePassword(password);

    if (isMatch) {
      return {
        error: "The new password cannot be the same as the old password",
      };
    }

    await RedisService.deleteKey("resetPasswordCode", userId);
    await userRecord.updatePassword(password);

    return { message: "Your password has been changed" };
  }

  async changePassword(userId, password, newPassword) {
    if (!this.isValidId(userId)) {
      return { error: "Your password could not be changed" };
    }

    const userRecord = await this.userModel.findById(userId, "password");
    const isMatch = userRecord.comparePassword(password);

    if (!isMatch) {
      return { error: "Your password could not be changed" };
    }

    if (userRecord.comparePassword(newPassword)) {
      return {
        error: "The new password cannot be the same as the old password",
      };
    }

    await userRecord.updatePassword(newPassword);
    return { message: "Your password has been changed" };
  }

  async changeEmail(userId, email) {
    if (!this.isValidId(userId)) {
      return { error: "Your email could not be changed" };
    }

    const user = await this.userModel.findById(userId, "email username");

    if (user.email === email) {
      return { error: "The new email cannot be the same as the old email" };
    }

    const userRecord = await this.userModel.findOne({ email }, "_id");

    if (userRecord) {
      return { error: "Your email could not be changed" };
    }

    await user.updateEmail(email);
    // İlk kayıt olmadığı için register maili yerine sadece email doğrulama maili yollayacağız.
    await this.sendVerificationEmail({
      _id: userId,
      email,
      username: user.username,
    });
    return { message: "Your email has been changed" };
  }

  async sendResetPasswordEmail(email) {
    const userRecord = await this.userModel.findOne({ email }, "_id");

    if (userRecord) {
      const code = `${userRecord._id}:${randomBytes(32).toString("hex")}`;

      // RabbitMQ kullanılmaya başlandığında kullanılacak
      // RabbitMQ.publish("mail:resetPassword", {
      //   email,
      //   resetPasswordCode: code,
      // });

      await MailService.sendMail("resetPassword", {
        email,
        resetPasswordCode: code,
      });

      await RedisService.setKey(
        `resetPasswordCode:${userRecord._id}`,
        code,
        60 * 60 * 24
      );

      return { message: "Password reset email sent" };
    }

    return { error: "Password reset email failed" };
  }

  async sendVerificationEmail(user) {
    const randomCode = randomBytes(32).toString("hex");
    const code = `${user._id}:${randomCode}`;

    // RabbitMQ kullanılmaya başlandığında kullanılacak
    // RabbitMQ.publish("mail:registration", {
    //   email: user.email,
    //   username: user.username,
    //   emailVerificationCode: code,
    // });

    // İlk kayıt olmadığı için zamanı gelince değiştirilecek.
    await MailService.sendMail("registration", {
      email: user.email,
      username: user.username,
      emailVerificationCode: code,
    });

    return await RedisService.setKey(
      `emailVerificationCode:${user._id}`,
      code,
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
      {
        _id: userId,
      },
      {
        $push: {
          loginInfo,
        },
      }
    );
  }

  // User id ile arama yapılırken id değerinin geçerli olup olmadığını kontrol eder.
  isValidId(userId) {
    return ObjectId.isValid(userId);
  }

  // Wallet Service
  async createWallet(userId) {
    const userRecord = await this.userModel.findById(userId, "wallet");

    if (!userRecord) {
      return false;
    }

    if (userRecord.wallet?.address) {
      return false;
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

    return { address: wallet.address };
  }

  async saveBTCAddress(userId, address) {
    if (!WalletService.isValidAddress(address)) {
      return false;
    }

    const userRecord = await this.userModel.findById(userId, "bitcoinAddress");

    if (!userRecord) {
      return false;
    }

    if (userRecord.bitcoinAddress === address) {
      return true;
    }

    await this.userModel.updateOne(
      {
        _id: userId,
      },
      {
        $set: {
          bitcoinAddress: address,
          bitcoinAddressCreatedAt: new Date(),
        },
      }
    );

    return true;
  }
}

const Dependencies = { userModel };

module.exports = new UserService(Dependencies);
