const config = require("./index");

module.exports = {
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
    tags: [{ name: "auth", description: "Authentication related end-points" }],
    components: {
      schemas: {
        User: {
          type: "object",
          required: [
            "id",
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
};
