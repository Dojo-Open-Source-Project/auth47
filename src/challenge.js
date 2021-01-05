"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { URL } = require('url');
const { Auth47URI } = require('./uri');
const { Auth47Parser } = require('./parser');


class Auth47Challenge {

  constructor() {
    this._scheme = null;
    this._nonce = null;
    this._r = null;
    this._e = null;
  }

  static fromString(strChallenge) {
    const parser = new Auth47Parser();
    const pojo = parser.parseChallenge(strChallenge);
    return Auth47Challenge.fromPojo(pojo);
  }

  static fromPojo(pojo) {
    let challenge = new Auth47Challenge();
    challenge._scheme = pojo.scheme;
    challenge._nonce = pojo.nonce;
    for (let param of pojo.params)
      challenge[`_${param.name}`] = param.value;
    return challenge;
  }

  static fromAuth47URI(uri) {
    if (!uri instanceof Auth47URI)
      throw new Error('Argument is not an Auth47URI');

    let challenge = new Auth47Challenge();
    challenge._scheme = uri.scheme;
    challenge._nonce = uri.nonce;
    challenge._r = uri.resourceUri;
    challenge._e = uri.expire;
    return challenge;
  }

  get scheme() {
    return this._scheme;
  }

  get nonce() {
    return this._nonce;
  }

  get resourceUri() {
    if (this._r)
      return this._r;
    else if (this.isHttpResource())
      return this._c;
    else if (this.isSorobanResource())
      return 'srbn';
  }

  get expire() {
    return this._e;
  }

  isValid() {
    try {
      const parser = new Auth47Parser();
      parser.parseChallenge(this.toString());
      return true;
    } catch(e) {
      return false;
    }
  }

  isHttpResource() {
    return this._r && this._r instanceof URL;
  }

  isSorobanResource() {
    return this._r && this._r == 'srbn';
  }

  toString() {
    let rsc;
    if (this.isSorobanResource()) {
      rsc = 'srbn';
    } else if (this.isHttpResource()) {
      rsc = this._r.toString();
    }
    let uri = `${this._scheme}://${this._nonce}?r=${rsc}`;
    if (this._e) {
      uri += `&e=${this._e}`;
    }
    return uri;
  }

}
exports.Auth47Challenge = Auth47Challenge;
