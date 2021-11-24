const config = require("../config/services");
const bitcoin = require("bitcoinjs-lib");
const sb = require("satoshi-bitcoin");
const crypto = require("crypto");
const got = require("got");

class WalletService {
  constructor() {
    this.network = bitcoin.networks.bitcoin;
    this.request = got.extend({
      prefixUrl: "https://sochain.com/api/v2/",
      headers: { "Content-Type": "application/json" },
      responseType: "json",
    });
    this.algorithm = config.wallet.encryptAlgorithm;
  }

  /**
   * @param {string} address Bitcoin address.
   * @returns {object} Returns a confirmed balance and an unconfirmed balance.
   * @returns {null} If the address is not found.
   */
  async getBalance(address) {
    const url = `get_address_balance/BTCTEST/${address}`;
    const { body } = await this.request.get(url);

    if (body.status === "success") {
      return {
        confirmed_balance: sb.toSatoshi(body.data.confirmed_balance),
        unconfirmed_balance: sb.toSatoshi(body.data.unconfirmed_balance),
      };
    }

    return null;
  }

  /**
   * @param {string} address Bitcoin address.
   * @returns {object} Returns transaction id.
   * @returns {null} If no unspent transaction or address is not found.
   */
  async getTxUnspent(address) {
    const url = `get_tx_unspent/BTCTEST/${address}`;
    const { body } = await this.request.get(url);

    if (body.status === "success") {
      const index = body.data.txs.length - 1;
      return body.data.txs[index];
    }

    return null;
  }

  /**
   * @param {string} txId Transaction ID
   * @param {string} userBtcAddress User's own bitcoin address.
   * @param {string} myUserBtcAddress The bitcoin address we created for the user.
   * @returns {object} Returns an object with the transaction hex, input, output, fee and status.
   * @returns {null} If the transaction is not found.
   */
  async getTx(txId, userBtcAddress, myUserBtcAddress) {
    const url = `get_tx/BTCTEST/${txId}`;
    const { body } = await this.request.get(url);

    if (body.status === "success") {
      return {
        txid: body.data.txid,
        tx_hex: body.data.tx_hex,
        input: body.data.inputs.reduce((acc, input) => {
          if (input.address === userBtcAddress) {
            acc.address = input.address;
            acc.value = sb.toSatoshi(input.value);
            acc.script = input.script;
            acc.witness = input.witness;
          }

          return acc;
        }, {}),
        output: body.data.outputs.reduce((acc, output) => {
          if (output.address === myUserBtcAddress) {
            acc.address = output.address;
            acc.value = sb.toSatoshi(output.value);
            acc.index = output.output_no;
          }

          return acc;
        }, {}),
        fee: body.data.network_fee,
      };
    }

    return null;
  }

  async sendTx(txHex) {
    const url = `send_tx/BTCTEST`;
    const { body } = await this.request.post(url, {
      json: { tx_hex: txHex },
    });

    if (body.status === "success") {
      return {
        status: "success",
        txid: body.data.txid,
      };
    }

    return {
      status: "failed",
    };
  }

  async sendBTC() {
    // Kullanıcı için oluşturduğumuz bitcoin adresi
    const unspentData = await this.getTxUnspent(
      "2ND4UWTyhim1BvdPADnvZ4evfBgSSFxhW1T"
    );

    if (!unspentData) {
      return false;
    }

    const txData = await this.getTx(
      unspentData.txid,
      "tb1qqglazgxqf0ax2284pekfw2r2gk6zlus8jp8l9l", // Kullanıcının bitcoin adresi
      "2ND4UWTyhim1BvdPADnvZ4evfBgSSFxhW1T" // Kullanıcı için oluşturduğumuz bitcoin adresi
    );

    if (!txData) {
      return false;
    }

    const WIF = "cPm4uhg6Vs1d8utc1U2MEY2wrbD3tzMGM7CiYGjm92A2cPGR4Ffx";
    const keypairSpend = bitcoin.ECPair.fromWIF(WIF, network);
    const p2shWallet = bitcoin.payments.p2sh({
      redeem: bitcoin.payments.p2wpkh({
        pubkey: keypairSpend.publicKey,
        network: network,
      }),
      network: network,
    });
    const redeemScript = p2shWallet.redeem.output.toString("hex");

    const psbt = new bitcoin.Psbt({ network })
      .addInput({
        hash: txData.txid,
        index: txData.output.index,
        nonWitnessUtxo: Buffer.from(txData.tx_hex, "hex"),
        redeemScript: Buffer.from(redeemScript, "hex"),
      })
      .addOutput({
        address: config.wallet.BTCAddress, // Bizim hesabımıza gönderecek
        value: txData.output.value,
      });

    psbt.signInput(0, keypairSpend);
    psbt.validateSignaturesOfInput(0);
    psbt.finalizeAllInputs();

    const txHex = psbt.extractTransaction().toHex();
    const sendTxData = await this.sendTx(txHex);
    return sendTxData;
  }

  /**
   * @returns {object} Returns an bitcoin address and encrypted private key.
   */
  createWallet() {
    const keyPair = bitcoin.ECPair.makeRandom({ network: this.network });
    const { address } = bitcoin.payments.p2sh({
      redeem: bitcoin.payments.p2wpkh({
        pubkey: keyPair.publicKey,
        network: this.network,
      }),
      network: this.network,
    });

    return {
      address,
      privateKey: this.encrypt(keyPair.toWIF()),
      createdAt: new Date(),
    };
  }

  /**
   * @param {string} privateKey Bitcoin private key.
   * @returns {string} Returns an encrypted private key.
   */
  encrypt(privateKey) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      this.algorithm,
      config.wallet.secretKey,
      iv
    );

    const encrypted = Buffer.concat([
      cipher.update(privateKey),
      cipher.final(),
    ]);

    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
  }

  /**
   * @param {string} encryptedPrivateKey Encrypted private key.
   * @returns {string} Returns a decrypted private key.
   */
  decrypt(encryptedPrivateKey) {
    const [iv, cipher] = encryptedPrivateKey.split(":");
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      config.wallet.secretKey,
      Buffer.from(iv, "hex")
    );

    const decrpyted = Buffer.concat([
      decipher.update(Buffer.from(cipher, "hex")),
      decipher.final(),
    ]);

    return decrpyted.toString();
  }

  /**
   * @param {string} address Bitcoin address.
   * @returns {boolean} Returns true if the address is valid, false if it is invalid.
   */
  isValidAddress(address) {
    try {
      bitcoin.address.toOutputScript(address, this.network);
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = new WalletService();
