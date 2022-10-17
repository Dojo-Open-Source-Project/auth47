import {Auth47Parser} from './parser.js';
import {SorobanURI} from './soroban';


export class Auth47URI {
    private _scheme: string | null;
    private _nonce: string | null;
    private _c: URL | SorobanURI | null;
    private _r: string | URL | null;
    private _e: number | null;

    constructor() {
        this._scheme = null;
        this._nonce = null;
        this._c = null;
        this._r = null;
        this._e = null;
    }

    static fromString(strUri: string): Auth47URI {
        const parser = new Auth47Parser();
        const pojo = parser.parseUri(strUri);
        return Auth47URI.fromPojo(pojo);
    }

    static fromPojo(pojo: any) {
        const uri = new Auth47URI();
        uri._scheme = pojo.scheme;
        uri._nonce = pojo.nonce;
        for (const param of pojo.params) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            uri[`_${param.name}`] = param.value;
        }
        return uri;
    }

    get scheme(): string | null {
        return this._scheme;
    }

    get nonce(): string | null {
        return this._nonce;
    }

    get callbackUri(): URL | SorobanURI | null {
        return this._c;
    }

    get resourceUri(): string | URL | SorobanURI | null | undefined {
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
        } catch {
            return false;
        }
    }

    isHttpCallback(): boolean {
        return Boolean(this._c && this._c instanceof URL);
    }

    isSorobanCallback(): boolean {
        return Boolean(this._c && this._c instanceof SorobanURI);
    }

    isHttpResource(): boolean {
        return Boolean(this._r ? (this._r instanceof URL) : this.isHttpCallback());
    }

    isSorobanResource() {
        return this._r ? (this._r === 'srbn') : this.isSorobanCallback();
    }

    toString() {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
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
