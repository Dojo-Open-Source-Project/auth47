export class SorobanURI {
    private _scheme: string | null;
    private _channel: string | null;
    private _instanceUri: URL | null;

    constructor() {
        this._scheme = null;
        this._channel = null;
        this._instanceUri = null;
    }

    static fromString(strUri: string): SorobanURI {
        const uri = new SorobanURI();
        uri._parse(strUri);
        return uri;
    }

    get scheme(): string | null {
        return this._scheme;
    }

    get channel(): string | null {
        return this._channel;
    }

    get gatewayURI(): URL | null {
        return this._instanceUri;
    }

    isValid(): boolean {
        try {
            SorobanURI.fromString(this.toString());
            return true;
        } catch {
            return false;
        }
    }

    private _parse(strUri: string): void {
        const split1 = strUri.split('://');

        if (split1.length !== 2)
            this._throwError('invalid');

        const split2 = split1[1].split('@');
        const tokens = [split1[0], ...split2];

        if (!(['srbn', 'srbns'].includes(tokens[0])))
            this._throwError('invalid');

        this._scheme = tokens[0];

        if (tokens[1].match(/^[\da-f]+$/i) == null || tokens[1].length !== 16)
            this._throwError('invalid');

        this._channel = tokens[1];

        if (tokens.length === 3) {
            try {
                const derivedScheme = (this._scheme === 'srbn') ? 'http' : 'https';
                const url = new URL(`${derivedScheme}://${tokens[2]}`);

                if (url.username || url.password || url.search || url.hash)
                    this._throwError('invalid');

                this._instanceUri = url;
            } catch {
                this._throwError('invalid');
            }

        }
    }

    toString(): string {
        if (this._scheme == null || this._channel == null)
            this._throwError('invalid');

        let result = `${this._scheme}://${this._channel}`;

        if (this._instanceUri != null)
            result += `@${this._instanceUri.host}${this._instanceUri.pathname}`;

        return result;
    }

    private _throwError(errorCode: 'invalid') {
        switch (errorCode) {
            case 'invalid': {
                throw new Error('Invalid Soroban URI');
            }
        }
    }

}
