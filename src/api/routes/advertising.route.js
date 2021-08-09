const advertisingController = require("../controllers/advertising.controller");
const tokenVerifier = require("../../middleware/tokenVerifier");
const config = require("../../config/index");

const routes = [
  {
    method: "POST",
    url: `/${config.apiVersion}/advertising`,
    preValidation: tokenVerifier,
    handler: advertisingController.createAdvertising,
  },
];

module.exports = routes;
