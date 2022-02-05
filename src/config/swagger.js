const { env, port, swaggerRoutePrefix } = require("./index");

module.exports = {
  routePrefix: swaggerRoutePrefix,
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
        url:
          env === "development"
            ? `http://localhost:${port}`
            : "https://admayor.herokuapp.com",
        description: env === "development" ? "Development" : "Production",
      },
    ],
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
              enum: ["USER", "ADMIN"],
              default: "USER",
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
