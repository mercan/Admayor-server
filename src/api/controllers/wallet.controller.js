const UserService = require("../../services/UserService");

const createWallet = async (req, res) => {
  const wallet = await UserService.createWallet(req.user.id);

  if (!wallet) {
    return res.status(400).send({
      statusCode: 400,
      message: "Fail to create wallet.",
    });
  }

  return res.status(200).send({
    statusCode: 200,
    message: "Wallet created successfully.",
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

  if (!wallet) {
    return res.status(400).send({
      statusCode: 400,
      message: "Fail to save bitcoin address.",
    });
  }

  return res.status(200).send({
    statusCode: 200,
    message: "Bitcoin address saved successfully.",
  });
};

module.exports = { createWallet, saveBTCAddress };
