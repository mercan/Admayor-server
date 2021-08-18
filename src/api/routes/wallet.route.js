const config = require("../../config/index");
const walletController = require("../controllers/wallet.controller");
const tokenVerifier = require("../../middleware/tokenVerifier");

const createWalletSchema = require("../../schema/wallet/CreateWalletSchema.json");
const saveBTCAddressSchema = require("../../schema/wallet/SaveBTCAddressSchema.json");

const routes = [
  {
    method: "GET",
    url: `/${config.apiVersion}/wallet/create`,
    schema: createWalletSchema,
    preValidation: tokenVerifier,
    handler: walletController.createWallet,
  },
  {
    method: "GET",
    url: `/${config.apiVersion}/wallet/saveAddress`,
    schema: saveBTCAddressSchema,
    preValidation: tokenVerifier,
    handler: walletController.saveBTCAddress,
  },
];

module.exports = routes;
