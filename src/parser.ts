import {SorobanURI} from './soroban';

export const AUTH47_SCHEME = 'auth47';
export const AUTH47_PARAMS = ['c', 'e', 'r'];

const enum Mode {
    PARSER_MODE_URI,
    PARSER_MODE_CHALLENGE
}

type Param = {
    name: 'c' | 'e' | 'r'
    value: URL | SorobanURI | number
}

export class Auth47Parser {
    private _scheme: string | null;
    private _nonce: string | null;
    private _params: Array<Param> | null;

    constructor() {
        this._scheme = null;
        this._nonce = null;
        this._params = [];
    }

    parseUri(strUri: string) {
        const tokens = this._tokenize(strUri, Mode.PARSER_MODE_URI);
        this._parse(tokens, Mode.PARSER_MODE_URI);
        return this.toPojo();
    }

    parseChallenge(strChallenge: string) {
        const tokens = this._tokenize(strChallenge, Mode.PARSER_MODE_CHALLENGE);
        this._parse(tokens, Mode.PARSER_MODE_CHALLENGE);
        return this.toPojo();
    }

    toPojo() {
        return {
            scheme: this._scheme,
            nonce: this._nonce,
            params: this._params
        };
    }

    _tokenize(strUri: string, mode: Mode) {
        const split1 = strUri.split('?');
        if (split1.length !== 2)
            this._throwError('invalid', mode);

        const split2a = split1[0].split('://');
        if (split2a.length !== 2)
            this._throwError('invalid', mode);

        const split2b = split1[1].split('&');
        if (split2b.length === 0)
            this._throwError('invalid', mode);

        return [...split2a, ...split2b];
    }

    _parse(tokens: string[], mode: Mode) {
        this._scheme = this._parseAuth47Scheme(tokens);
        if (this._scheme == null)
            this._throwError('invalid', mode);

        this._nonce = this._parseNonce(tokens.slice(1));
        if (this._nonce == null)
            this._throwError('invalid', mode);

        for (let i = 2; i < tokens.length; i++) {
            const param = this._parseParam(tokens.slice(i), mode);
            if (param == null)
                this._throwError('invalid', mode);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this._params.push(param);
        }
    }

    _parseAuth47Scheme(tokens: string[]) {
        return (tokens[0] === AUTH47_SCHEME) ? AUTH47_SCHEME : null;
    }

    _parseNonce(tokens: string[]): string | null {
        const token = tokens[0];
        return /^[\da-z]+$/i.test(token) ? token : null;
    }

    _parseParam(tokens: string[], mode: Mode) {
        const param = tokens[0];

        const split1 = param.split('=');
        if (split1.length !== 2)
            return null;

        const paramName = this._parseParamName(split1, mode);
        if (paramName == null)
            return null;

        const paramValue = this._parseParamValue(split1);
        if (paramValue == null)
            return null;

        return {
            'name': paramName,
            'value': paramValue
        };
    }

    _parseParamName(tokens: string[], mode: Mode) {
        const paramName = tokens[0];
        if (!(AUTH47_PARAMS.includes(paramName)))
            return null;
        if (paramName === 'c' && mode === Mode.PARSER_MODE_CHALLENGE)
            return null;
        return paramName;
    }

    _parseParamValue(tokens: string[]) {
        const paramName = tokens[0];
        const paramValue = tokens[1];

        switch (paramName) {
            case 'c': {
                let uri: URL | SorobanURI | null = this._parseSorobanUri(paramValue);
                if (uri == null)
                    uri = this._parseHttpUri(paramValue);
                return uri;
            }
            case 'e': {
                return this._parseUnixTimestamp(paramValue);
            }
            case 'r': {
                let resource: URL | 'srbn' | null = this._parseSorobanResource(paramValue);
                if (resource == null)
                    resource = this._parseHttpUri(paramValue);
                return resource;
            }
        }

        return null;
    }

    _parseUnixTimestamp(token: string): number | null {
        const value = Number.parseInt(token, 10);
        return (Number.isNaN(value)) ? null : value;
    }

    _parseHttpUri(token: string): URL | null {
        let url;
        try {
            url = new URL(token);
        } catch {
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

    _parseSorobanUri(token: string) {
        let uri;
        try {
            uri = SorobanURI.fromString(token);
        } catch {
            return null;
        }
        return uri;
    }

    _parseSorobanResource(token: string): 'srbn' | null {
        return (token === 'srbn') ? token : null;
    }

    _throwError(errorCode: 'invalid', mode: Mode) {
        const strMode = (mode === Mode.PARSER_MODE_URI) ? 'URI' : 'challenge';
        switch (errorCode) {
            case 'invalid': {
                throw new Error(`Invalid auth47 ${strMode}`);
            }
        }
    }

}
