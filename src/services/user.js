const tokenCreate = require("../utils/tokenCreate");
const userModel = require("../models/user");
const RedisService = require("./Redis");

class UserService {
  constructor({ RedisService, userModel }) {
    this.client = RedisService.init();
    this.userModel = userModel;
  }

  async Signup(user) {
    try {
      const userRecord = await this.userModel.create(user);
      return { token: tokenCreate(userRecord) };
    } catch (err) {
      return { errorCode: err.code };
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

    return { token: tokenCreate(userRecord) };
  }

  async createApiKey(user) {
    const userRecord = await this.userModel.findOne({ email: user.email });

    if (!userRecord) {
      return { error: "User not found" };
    }

    const apiKey = await userRecord.createApiKey();

    return apiKey;
  }

  async findByApiKey(apiKey) {
    const userRecord = await this.userModel.findByApiKey(apiKey);

    if (!userRecord) {
      return { error: "User not found" };
    }

    return userRecord;
  }
}

const Dependencies = {
  RedisService,
  userModel,
};

module.exports = new UserService(Dependencies);
