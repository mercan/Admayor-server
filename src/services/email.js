const config = require("../config/index");
const sgMail = require("@sendgrid/mail");

class EmailService {
  constructor() {
    this.sendgrid = sgMail.setApiKey(config.service.email.API_KEY);
    this.from = config.service.email.from;
  }

  sendVerificationEmail(email, token) {
    const subject = "Email Verification - AdMayor";
    const to = email;
    const url = `${config.base_url}/auth/emailVerify?code=${token}`;
    const html = `
      <p>Hello,</p>
      <p>Please click the link below to verify your email address:</p>
      <p><a href="${url}">Email Verify</a></p>
    `;

    const message = {
      to,
      from: this.from,
      subject,
      html,
    };

    return this.sendgrid.send(message);
  }
}

module.exports = new EmailService();
