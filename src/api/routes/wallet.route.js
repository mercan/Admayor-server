const config = require("../../config/index");
const walletController = require("../controllers/wallet.controller");
const tokenVerifier = require("../../middleware/tokenVerifier");

const createWalletSchema = require("../../schema/wallet/CreateWalletSchema.json");

const routes = [
  {
    method: "GET",
    url: `/${config.apiVersion}/wallet/create`,
    schema: createWalletSchema,
    preValidation: tokenVerifier,
    handler: walletController.createWallet,
  },
];

module.exports = routes;
