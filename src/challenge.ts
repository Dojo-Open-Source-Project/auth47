import {Auth47Parser} from './parser';
import {Auth47URI} from './uri';
import {SorobanURI} from './soroban';

export class Auth47Challenge {
    private _scheme: string | null;
    private _nonce: string | null;
    private _r: string | URL | SorobanURI | null | undefined;
    private _e: number | null;

    constructor() {
        this._scheme = null;
        this._nonce = null;
        this._r = null;
        this._e = null;
    }

    static fromString(strChallenge: string) {
        const parser = new Auth47Parser();
        const pojo = parser.parseChallenge(strChallenge);
        return Auth47Challenge.fromPojo(pojo);
    }

    static fromPojo(pojo: any) {
        const challenge = new Auth47Challenge();
        challenge._scheme = pojo.scheme;
        challenge._nonce = pojo.nonce;
        for (const param of pojo.params) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            challenge[`_${param.name}`] = param.value;
        }
        return challenge;
    }

    static fromAuth47URI(uri: unknown) {
        if (!(uri instanceof Auth47URI))
            throw new Error('Argument is not an Auth47URI');

        const challenge = new Auth47Challenge();
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

    get expire() {
        return this._e;
    }

    isValid() {
        try {
            const parser = new Auth47Parser();
            parser.parseChallenge(this.toString());
            return true;
        } catch {
            return false;
        }
    }

    isHttpResource(): boolean {
        return Boolean(this._r && this._r instanceof URL);
    }

    isSorobanResource(): boolean {
        return Boolean(this._r && this._r === 'srbn');
    }

    toString(): string {
        let rsc;
        if (this.isSorobanResource()) {
            rsc = 'srbn';
        } else if (this.isHttpResource()) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            rsc = this._r.toString();
        }
        let uri = `${this._scheme}://${this._nonce}?r=${rsc}`;
        if (this._e) {
            uri += `&e=${this._e}`;
        }
        return uri;
    }

}
