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
    routePrefix: "/documentation",
    swagger: {
      info: {
        title: "AdMayor swagger",
        description: "AdMayor Fastify swagger API",
        version: "1.0.0",
      },
      externalDocs: {
        url: "https://swagger.io",
        description: "Find more info here",
      },
      host: "localhost",
      schemes: ["https", "http"],
      consumes: ["application/json"],
      produces: ["application/json"],
      tags: [
        { name: "auth", description: "Authentication related end-points" },
      ],
      definitions: {
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
            password: { type: "string" },
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
      securityDefinitions: {
        Bearer: {
          type: "apiKey",
          name: "Authorization",
          description: "Value: Bearer {jwt}",
          in: "header",
        },
      },
    },
    uiConfig: {
      docExpansion: "full",
      deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    exposeRoute: true,
  });

  const routes = require("./api/routes/index");
  routes.forEach((route) => app.route(route));

  return app;
}

module.exports = build;
