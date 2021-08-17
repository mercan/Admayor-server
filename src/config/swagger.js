const config = require("./index");

module.exports = {
  routePrefix: config.swaggerRoutePrefix,
  openapi: {
    info: {
      title: "AdMayor API",
      version: "1.0.0",
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
      { name: "wallet", description: "Wallet related end-points" },
      { name: "report", description: "Report related end-points" },
    ],
    components: {
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string", format: "email" },
            username: { type: "string" },
            password: { type: "string", format: "password" },
            role: {
              type: "string",
              enum: ["admin", "user"],
              default: "user",
            },
            emailVerified: { type: "boolean", default: false },
            bitcoinAddress: { type: "string" },
            wallet: {
              type: "object",
              required: ["address", "privateKey", "createdAt"],
              properties: {
                address: { type: "string" },
                privateKey: { type: "string" },
                createdAt: { type: "string", format: "date-time" },
              },
            },
            lastLogin: { type: "string", format: "date-time" },
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
