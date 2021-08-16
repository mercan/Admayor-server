const authRoutes = require("./auth.route");
const advertisingRoutes = require("./advertising.route");
const walletRoutes = require("./wallet.route");
const reportRoutes = require("./report.route");

module.exports = [
  ...authRoutes,
  ...advertisingRoutes,
  ...walletRoutes,
  ...reportRoutes,
];
