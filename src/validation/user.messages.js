const emailMessage = {
  "string.max": "Email must be 100 characters or less",
  "string.email": "Please enter a valid email address",
  "string.empty": "Please enter your email address",
  "any.required": "Please enter your email address",
};

const usernameMessage = {
  "string.min": "Please enter a username with at least 4 characters",
  "string.max": "Please enter a username with at most 16 characters",
  "string.empty": "Please enter your username",
  "any.invalid": "This username is unavailable",
  "any.required": "Please enter your username",
};

const passwordMessage = {
  "string.min": "Please enter a password with at least 6 characters",
  "string.max": "Please enter a password with at most 100 characters",
  "string.empty": "Please enter your password",
  "any.required": "Please enter your password",
};

const codeMessage = {
  "any.required": "Code is required",
};

const objectMessage = {
  "object.base": "Please fill out all required fields",
};

module.exports = {
  emailMessage,
  usernameMessage,
  passwordMessage,
  codeMessage,
  objectMessage,
};
