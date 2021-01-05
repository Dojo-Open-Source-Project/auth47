"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { URL } = require('url');
const { SorobanURI } = require('./soroban');


const AUTH47_SCHEME = 'auth47';
exports.AUTH47_SCHEME = AUTH47_SCHEME;

const AUTH47_PARAMS = ['c', 'e', 'r'];
exports.AUTH47_PARAMS = AUTH47_PARAMS;

const PARSER_MODE_URI = 0;
exports.PARSER_MODE_URI = PARSER_MODE_URI;

const PARSER_MODE_CHALLENGE = 1;
exports.PARSER_MODE_CHALLENGE = PARSER_MODE_CHALLENGE;


class Auth47Parser {

  constructor() {
    this._scheme = null;
    this._nonce = null;
    this._params = [];
  }

  parseUri(strUri) {
    const tokens = this._tokenize(strUri, PARSER_MODE_URI);
    this._parse(tokens, PARSER_MODE_URI);
    return this.toPojo();
  }

  parseChallenge(strChallenge) {
    const tokens = this._tokenize(strChallenge, PARSER_MODE_CHALLENGE);
    this._parse(tokens, PARSER_MODE_CHALLENGE);
    return this.toPojo();
  }

  toPojo() {
    return {
      'scheme': this._scheme,
      'nonce': this._nonce,
      'params': this._params
    };
  }

  _tokenize(strUri, mode) {
    const split1 = strUri.split('?');
    if (split1.length != 2)
      this._throwError('invalid', mode);

    const split2a = split1[0].split('://');
    if (split2a.length != 2)
      this._throwError('invalid', mode);

    const split2b = split1[1].split('&');
    if (split2b.length == 0)
      this._throwError('invalid', mode);

    return split2a.concat(split2b);
  }

  _parse(tokens, mode) {
    this._scheme = this._parseAuth47Scheme(tokens, mode);
    if (this._scheme == null)
      this._throwError('invalid', mode);

    this._nonce = this._parseNonce(tokens.slice(1), mode);
    if (this._nonce == null)
      this._throwError('invalid', mode);

    for (let i=2; i < tokens.length; i++) {
      const param = this._parseParam(tokens.slice(i), mode);
      if (param == null)
        this._throwError('invalid', mode);
      this._params.push(param);
    }
  }

  _parseAuth47Scheme(tokens, mode) {
    return (tokens[0] == AUTH47_SCHEME) ? AUTH47_SCHEME : null;
  }

  _parseNonce(tokens, mode) {
    const token = tokens[0];
    return (token.match(/^[a-zA-Z0-9]+$/i) !== null) ? token : null;
  }

  _parseParam (tokens, mode) {
    const param = tokens[0];

    const split1 = param.split('=');
    if (split1.length != 2)
      return null;

    const paramName = this._parseParamName(split1, mode);
    if (paramName == null)
      return null;

    const paramValue = this._parseParamValue(split1, mode);
    if (paramValue == null)
      return null;

    return {
      'name': paramName,
      'value': paramValue
    };
  }

  _parseParamName(tokens, mode) {
    const paramName = tokens[0];
    if (!(AUTH47_PARAMS.includes(paramName)))
      return null;
    if (paramName == 'c' && mode == PARSER_MODE_CHALLENGE)
      return null;
    return paramName;
  }

  _parseParamValue(tokens, mode) {
    const paramName = tokens[0];
    const paramValue = tokens[1];

    switch(paramName) {
      case 'c':
        let uri = this._parseSorobanUri(paramValue, mode);
        if (uri == null)
          uri = this._parseHttpUri(paramValue, mode);
        return uri;
      case 'e':
        return this._parseUnixTimestamp(paramValue, mode);
      case 'r':
        let resource = this._parseSorobanResource(paramValue, mode);
        if (resource == null)
          resource = this._parseHttpUri(paramValue, mode);
        return resource;
    }

    return null;
  }

  _parseUnixTimestamp(token, mode) {
    const value = parseInt(token);
    return (isNaN(value)) ? null : value;
  }

  _parseHttpUri(token, mode) {
    let url;
    try {
      url = new URL(token);
    } catch (e) {
      return null;
    }
    if (!(['http:', 'https:'].includes(url.protocol)))
      return null;
    if (url.username || url.password)
      return null;
    if (url.search)
      return null;
    if (url.hash)
      return null;
    return url;
  }

  _parseSorobanUri(token, mode) {
    let uri;
    try {
      uri = SorobanURI.fromString(token);
    } catch(e) {
      return null;
    }
    return uri;
  }

  _parseSorobanResource(token, mode) {
    return (token == 'srbn') ? token : null;
  }

  _throwError(errorCode, mode) {
    const strMode = (mode == PARSER_MODE_URI) ? 'URI' : 'challenge';
    switch (errorCode) {
      case 'invalid':
        throw new Error(`Invalid auth47 ${strMode}`);
        break;
    }
  }

}
exports.Auth47Parser = Auth47Parser;
