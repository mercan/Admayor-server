const Fastify = require("fastify");

// Plugins
const swaggerPlugin = require("@fastify/swagger");
const helmetPlugin = require("@fastify/helmet");

// Config
const swaggerConfig = require("./config/swagger.js");

// Routes
const routes = require("./api/routes/index");

// Database Connection for MongoDB
require("./helpers/database")();

// Export the Fastify Server
module.exports = function build(opts = {}) {
  const fastify = Fastify(opts);

  // Initialize Plugins
  fastify.register(helmetPlugin, { global: true });
  fastify.register(swaggerPlugin, swaggerConfig);

  // Initialize Routes
  routes.forEach((route) => fastify.route(route));

  return fastify;
};
