const authRoutes = require("./auth.route");
const advertisingRoutes = require("./advertising.route");
const walletRoutes = require("./wallet.route");

module.exports = [...authRoutes, ...advertisingRoutes, ...walletRoutes];
