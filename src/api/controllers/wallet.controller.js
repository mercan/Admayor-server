const UserService = require("../../services/user");

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

const saveBTCAddress = async (req, res) => {
  const { address } = req.query;

  if (!address) {
    return res.status(400).send({
      statusCode: 400,
      message: "Bitcoin address is required.",
    });
  }

  const wallet = await UserService.saveBTCAddress(req.user.id, address);

  if (wallet.error) {
    return res.status(400).send({
      statusCode: 400,
      message: wallet.error,
    });
  }

  return res.status(200).send({
    statusCode: 200,
    message: wallet.message,
  });
};

module.exports = { createWallet, saveBTCAddress };
