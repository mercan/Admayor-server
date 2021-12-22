const Fastify = require("fastify");

// Plugins
const helmetPlugin = require("fastify-helmet");
const formbodyPlugin = require("fastify-formbody");
const rateLimitPlugin = require("fastify-rate-limit");
const swStats = require("swagger-stats");
const fastifyExpressPlugin = require("fastify-express");
const swaggerPlugin = require("fastify-swagger");

// Configs
const swaggerConfig = require("./config/swagger.js");
const rateLimiterConfig = require("./config/rateLimiter.js");

// Routes
const routes = require("./api/routes/index");

// Database Connection for MongoDB
require("./helpers/database")();

// Create Fastify Server
function build(opts = {}) {
  const fastify = Fastify(opts);

  // Initialize Plugins
  fastify.register(helmetPlugin);
  fastify.register(formbodyPlugin);
  fastify.register(rateLimitPlugin, rateLimiterConfig);

  if (process.env.NODE_ENV !== "test") {
    fastify.register(fastifyExpressPlugin).then(() => {
      fastify.register(swStats.getFastifyPlugin, {
        uriPath: "/stats",
        name: "AdMayor Statistics",
      });
    });
  }

  fastify.register(swaggerPlugin, swaggerConfig);

  routes.forEach((route) => fastify.route(route));

  return fastify;
}

// Export the Fastify Server
module.exports = build;
