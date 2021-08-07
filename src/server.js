const config = require("./config/index");
const logger = require("./helpers/logger");

const server = require("./app")({
  logger,
  trustProxy: true,
});

server.listen(config.port, "0.0.0.0", (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }

  console.log(`Server listening on ${address}`);
  server.log.info(`Server listening on ${address}`);
});
