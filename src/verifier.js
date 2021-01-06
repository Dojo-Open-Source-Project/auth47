"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { networks } = require('bitcoinjs-lib');
const { verify } = require('bitcoinjs-message');
const { fromBase58 } = require('bip47-js');
const { Auth47URI } = require('./uri');
const { Auth47Challenge } = require('./challenge');


class Auth47Verifier {

  constructor(strCallbackURI) {
    this._c = strCallbackURI
  }

  get callbackUri() {
    return this._c;
  }

  set callbackUri(strCallbackURI) {
    this._c = strCallbackURI
  }

  /**
   * Generate an Auth47URI
   * @param {object} args
   *   {
   *     nonce (mandatory - alphanumeric): random nonce
   *     r     (optional - string)       : resource URI
   *     e     (optional - integer)      : expiry date/hour expressed as a unix timestamp (GMT)
   *   }
   */
  generateURI(args) {
    const nonce = args['nonce'] ? args['nonce'] : null;
    const c = this._c ? this._c : null;

    let strUri = `auth47://${nonce}?c=${c}`;
    if (args['r'])
      strUri += `&r=${args['r']}`;
    if (args['e'])
      strUri += `&e=${args['e']}`;

    return Auth47URI.fromString(strUri);
  }

  /**
   *
   * @param {object} proof
   *   {
   *     auth47_response (mandatory - string): protocol version
   *     challenge (mandatory - string): auth47 challenge
   *     signature (mandatory - string): signature
   *     nym (mandatory - string): payment code
   *   }
   * @param {bitcoinjs.networks} network (optional, default=networks.bitcoin)
   */
  verifyProof(proof, network) {
    try {
      network = network || networks.bitcoin;

      if (!proof['auth47_response'] || proof['auth47_response'] != '1.0')
        this._throwError('invalid_protocol_version');

      const challenge = Auth47Challenge.fromString(proof['challenge']);

      if (challenge.expire) {
        const now = new Date();
        const expiryDate = new Date(challenge.expire*1000);
        if (expiryDate.getTime() <= now.getTime())
          this._throwError('expired_proof');
      }

      const pcode = fromBase58(proof['nym']);
      const notifAddr = pcode.getNotificationAddress();

      const isValidSig = verify(
        proof['challenge'],
        network.messagePrefix,
        notifAddr,
        proof['signature']
      );

      if (!isValidSig)
        this._throwError('invalid_sig');

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  _throwError(errorCode) {
    switch (errorCode) {
      case 'invalid_protocol_version':
        throw new Error(`Invalid protocol version`);
        break;
      case 'expired_proof':
        throw new Error(`Expired proof`);
        break;
      case 'invalid_sig':
        throw new Error(`Invalid signature`);
        break;
    }
  }

}
exports.Auth47Verifier = Auth47Verifier;
