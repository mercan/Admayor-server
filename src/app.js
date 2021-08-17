const fastify = require("fastify");

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
const allRoutes = require("./api/routes/index");

// Database Connection for MongoDB
require("./helpers/database")();

// Create Fastify Server
function build(opts = {}) {
  const app = fastify(opts);

  // Initialize Plugins
  app.register(helmetPlugin);
  app.register(formbodyPlugin);
  app.register(rateLimitPlugin, rateLimiterConfig);
  app.register(fastifyExpressPlugin).then(() => {
    app.register(swStats.getFastifyPlugin, {
      swaggerSpec: swaggerConfig,
      basePath: "/",
    });
  });
  app.register(swaggerPlugin, swaggerConfig);

  const routes = allRoutes;
  routes.forEach((route) => app.route(route));

  return app;
}

// Export the Fastify Server
module.exports = build;
