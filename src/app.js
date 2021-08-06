const config = require("./config/index");
const fastify = require("fastify");

// Database connection
require("./helpers/database")();

function build(opts = {}) {
  const app = fastify(opts);

  app.register(require("fastify-helmet"));
  app.register(require("fastify-formbody"));
  app.register(require("fastify-rate-limit"), {
    global: false,
    errorResponseBuilder: function () {
      return {
        statusCode: 429,
        message: "Too Many Requests",
      };
    },
  });
  app.register(require("fastify-swagger"), {
    routePrefix: config.swaggerRoutePrefix,
    openapi: {
      info: {
        title: "AdMayor API",
        version: "0.0.1",
        contact: {
          name: "İbrahim Can Mercan",
          email: "imrcn77@gmail.com",
        },
      },
      servers: [
        {
          url: config.host,
          description:
            config.env === "development" ? "Development" : "Production",
        },
      ],
      host: "localhost",
      schemes: ["http", "https"],
      consumes: ["application/json"],
      produces: ["application/json"],
      tags: [
        { name: "auth", description: "Authentication related end-points" },
      ],
      components: {
        schemas: {
          User: {
            type: "object",
            required: [
              "_id",
              "email",
              "username",
              "password",
              "userType",
              "emailVerified",
              "createdAt",
              "updatedAt",
            ],
            properties: {
              _id: { type: "string" },
              email: { type: "string", format: "email" },
              username: { type: "string" },
              password: { type: "string", format: "password" },
              userType: {
                type: "string",
                enum: ["admin", "user"],
                default: "user",
              },
              emailVerified: { type: "boolean", default: false },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
        },
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
    staticCSP: true,
    exposeRoute: true,
  });

  const routes = require("./api/routes/index");
  routes.forEach((route) => app.route(route));

  return app;
}

module.exports = build;
