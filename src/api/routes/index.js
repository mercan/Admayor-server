const authRoutes = require("./auth.route");
const advertisingRoutes = require("./advertising.route");

module.exports = [...authRoutes, ...advertisingRoutes];
