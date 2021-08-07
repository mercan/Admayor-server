const config = require("../config/index");
const sgMail = require("@sendgrid/mail");
const logger = require("../helpers/logger");

class MailService {
  constructor() {
    this.mailService = sgMail.setApiKey(config.service.email.API_KEY);
    this.from = config.service.email.from;
  }

  chooseMailTemplate(mailFor) {
    switch (mailFor) {
      case "registration":
        return "d-b50470133f244d539c2f2bf7e59394ad";
      case "resetPassword":
        return "d-273b0386e79d4e6ab8d574860c381c57";
      default:
        return "ERROR";
    }
  }

  chooseDynamicData(templateId, user) {
    switch (templateId) {
      case "d-b50470133f244d539c2f2bf7e59394ad":
        return {
          username: user.username,
          emailVerificationLink: `https://admayor.herokuapp.com/auth/emailVerify?token=${user.emailVerificationCode}`,
        };
      case "d-273b0386e79d4e6ab8d574860c381c57":
        return {
          passwordResetLink: `https://admayor.herokuapp.com/auth/passwordReset?token=${user.passwordResetCode}`,
        };
      default:
        return "ERROR";
    }
  }

  async sendMail(mailFor, user) {
    const templateId = this.chooseMailTemplate(mailFor);
    const dynamicTemplateData = this.chooseDynamicData(templateId, user);

    const message = {
      from: this.from,
      to: user.email,
      dynamicTemplateData,
      templateId,
      hideWarnings: true,
    };

    const result = await this.mailService.send(message);

    result[0].statusCode === 202
      ? logger.info(`Mail sent to: ${user.email}`, { service: "Mail" })
      : logger.error(`Mail couldn't sent to ${user.email}.`, {
          service: "Mail",
        });
  }
}

module.exports = new MailService();
