import * as ecc from 'tiny-secp256k1';
import {verify} from 'bitcoinjs-message';
import {BIP47Factory, utils} from '@samouraiwallet/bip47';
import {Auth47URI} from './uri.js';
import {Auth47Challenge} from './challenge.js';

const networks = utils.networks;

type Network = typeof networks.bitcoin;

const bip47 = BIP47Factory(ecc);

interface Proof {
    auth47_response: string;
    challenge: string;
    signature: string;
    nym: string;
}

export class Auth47Verifier {
    private _c: string | undefined;

    constructor(strCallbackURI?: string) {
        this._c = strCallbackURI;
    }

    get callbackUri() {
        return this._c;
    }

    set callbackUri(strCallbackURI) {
        this._c = strCallbackURI;
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
    generateURI(args: any) {
        const nonce = args.nonce ?? null;
        const c = this._c ?? null;

        let strUri = `auth47://${nonce}?c=${c}`;
        if (args.r)
            strUri += `&r=${args.r}`;
        if (args.e)
            strUri += `&e=${args.e}`;

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
     * @param {Network} network (optional, default=networks.bitcoin)
     */
    verifyProof(proof: Proof, network: Network = networks.bitcoin) {
        try {
            if (!proof.auth47_response || proof.auth47_response !== '1.0')
                this._throwError('invalid_protocol_version');

            const challenge = Auth47Challenge.fromString(proof.challenge);

            if (challenge.expire) {
                const now = new Date();
                const expiryDate = new Date(challenge.expire * 1000);
                if (expiryDate.getTime() <= now.getTime())
                    this._throwError('expired_proof');
            }

            const pcode = bip47.fromBase58(proof.nym);
            const notifAddr = pcode.getNotificationAddress();

            const isValidSig = verify(
                proof.challenge,
                notifAddr,
                proof.signature,
                network.messagePrefix
            );

            if (!isValidSig)
                this._throwError('invalid_sig');

            return true;
        } catch {
            return false;
        }
    }

    _throwError(errorCode: 'invalid_protocol_version' | 'expired_proof' | 'invalid_sig') {
        switch (errorCode) {
            case 'invalid_protocol_version': {
                throw new Error('Invalid protocol version');
            }
            case 'expired_proof': {
                throw new Error('Expired proof');
            }
            case 'invalid_sig': {
                throw new Error('Invalid signature');
            }
        }
    }

}
