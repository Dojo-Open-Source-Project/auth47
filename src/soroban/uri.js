"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const URL = (typeof window === 'undefined') ? require('url').URL : window.URL;


class SorobanURI {

  constructor() {
    this._scheme = null;
    this._channel = null;
    this._instanceUri = null;
  }

  static fromString(strUri) {
    let uri = new SorobanURI();
    uri._parse(strUri);
    return uri;
  }

  get scheme() {
    return this._scheme;
  }

  get channel() {
    return this._channel;
  }

  get gatewayURI() {
    return this._instanceUri;
  }

  isValid() {
    try {
      SorobanURI.fromString(this.toString());
      return true;
    } catch(e) {
      return false;
    }
  }

  _parse(strUri) {
    const split1 = strUri.split('://');

    if (split1.length != 2)
      this._throwError('invalid');

    const split2 = split1[1].split('@');
    const tokens = [split1[0]].concat(split2);

    if (!(['srbn', 'srbns'].includes(tokens[0])))
      this._throwError('invalid');

    this._scheme = tokens[0];

    if (tokens[1].match(/^[a-fA-F0-9]+$/i) == null || tokens[1].length != 16)
      this._throwError('invalid');

    this._channel = tokens[1];

    if (tokens.length == 3) {
      let url;
      try {
        const derivedScheme = (this._scheme == 'srbn') ? 'http' : 'https';
        url = new URL(`${derivedScheme}://${tokens[2]}`);
      } catch(e) {
        this._throwError('invalid');
      }

      if (url.username || url.password || url.search || url.hash)
        this._throwError('invalid');

      this._instanceUri = url;
    }
  }

  toString() {
    if (this._scheme == null || this._channel == null)
      this._throwError('invalid');

    let result = `${this._scheme}://${this._channel}`;

    if (this._instanceUri != null)
      result += `@${this._instanceUri.host}${this._instanceUri.pathname}`;

    return result;
  }

  _throwError(errorCode) {
    switch (errorCode) {
      case 'invalid':
        throw new Error('Invalid Soroban URI');
        break;
    }
  }

}
exports.SorobanURI = SorobanURI;
