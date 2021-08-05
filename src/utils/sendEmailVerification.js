const config = require("../config/index");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(config.service.email.API_KEY);

module.exports = async (email, token) => {
  const from = config.service.email.from;
  const subject = "Email Verification - AdMayor";
  const to = email;
  //const text = "Please verify your email by clicking the link below:";
  const url = `${config.base_url}/auth/emailVerify?code=${token}`;
  const html = `<p>Please verify your email by clicking the link below:</p>
                  <p><a href="${url}">Email Verify</a></p>`;

  const message = {
    to,
    from,
    subject,
    html,
  };

  return sgMail.send(message);
};
