require("dotenv").config();

module.exports = {
  wallet: {
    encryptAlgorithm: process.env.SERVICE_WALLET_ENCRYPT_ALGORITHM,
    secretKey: process.env.SERVICE_WALLET_SECRET_KEY,
    BTCAddress: process.env.SERVICE_WALLET_BTC_ADDRESS,
  },
};
