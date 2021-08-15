const UserService = require("../../services/UserService");

const createWallet = async (req, res) => {
  const wallet = await UserService.createWallet(req.user.id);

  if (wallet.error) {
    return res.status(400).send({
      statusCode: 400,
      message: wallet.error,
    });
  }

  return res.status(200).send({
    statusCode: 200,
    message: wallet.message,
    address: wallet.address,
  });
};

module.exports = { createWallet };
