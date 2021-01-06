"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const URL = (typeof window === 'undefined') ? require('url').URL : window.URL;
const { Auth47Parser } = require('./parser');
const { SorobanURI } = require('./soroban');


class Auth47URI {

  constructor() {
    this._scheme = null;
    this._nonce = null;
    this._c = null;
    this._r = null;
    this._e = null;
  }

  static fromString(strUri) {
    const parser = new Auth47Parser();
    const pojo = parser.parseUri(strUri);
    return Auth47URI.fromPojo(pojo);
  }

  static fromPojo(pojo) {
    let uri = new Auth47URI();
    uri._scheme = pojo.scheme;
    uri._nonce = pojo.nonce;
    for (let param of pojo.params)
      uri[`_${param.name}`] = param.value;
    return uri;
  }

  get scheme() {
    return this._scheme;
  }

  get nonce() {
    return this._nonce;
  }

  get callbackUri() {
    return this._c;
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
      parser.parseUri(this.toString());
      return true;
    } catch(e) {
      return false;
    }
  }

  isHttpCallback() {
    return this._c && this._c instanceof URL;
  }

  isSorobanCallback() {
    return this._c && this._c instanceof SorobanURI;
  }

  isHttpResource() {
    return this._r ? (this._r instanceof URL) : this.isHttpCallback();
  }

  isSorobanResource() {
    return this._r ? (this._r == 'srbn') : this.isSorobanCallback();
  }

  toString() {
    let uri = `${this._scheme}://${this._nonce}?c=${this._c.toString()}`;
    if (this._r) {
      const rsc = this.isSorobanResource() ? 'srbn' : this._r.toString();
      uri += `&r=${rsc}`;
    }
    if (this._e) {
      uri += `&e=${this._e}`;
    }
    return uri;
  }

}
exports.Auth47URI = Auth47URI;
