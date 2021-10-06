const { rabbitmq: rabbitmqConfig } = require("../config/services");
const amqp = require("amqplib");
const logger = require("../helpers/logger");

class RabbitMQ {
  constructor() {
    this.connectionURL = rabbitmqConfig.connectURL;
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    try {
      this.connection = await amqp.connect(this.connectionURL);
      this.channel = await this.connection.createChannel();

      this.channel.assertQueue("mail:registration", {
        durable: true,
        autoDelete: false,
      });

      this.channel.assertQueue("mail:resetPassword", {
        durable: true,
        autoDelete: false,
      });

      logger.info("Connection to RabbitMQ", { service: "RabbitMQ" });
    } catch (error) {
      logger.error(`Connection failed: ${error}`, {
        service: "RabbitMQ",
      });

      process.exit(1);
    }
  }

  publish(queue, data) {
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
  }

  async close() {
    await this.channel.close();
    await this.connection.close();
  }
}

module.exports = new RabbitMQ();
