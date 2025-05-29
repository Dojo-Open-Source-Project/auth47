import {BIP47Factory, TinySecp256k1Interface} from '@samouraiwallet/bip47';
import * as utils from '@samouraiwallet/bip47/utils';
import {bitcoinMessageFactory} from '@samouraiwallet/bitcoinjs-message';

import {Auth47Error, validateProof, type Proof, createCallbackUri, type GenerateURIArgs, validateGenerateUriArgs} from './decoders.js';

type TinySecp256k1InterfaceJoined = TinySecp256k1Interface & Parameters<typeof bitcoinMessageFactory>[0]

type Network = typeof utils.networks.bitcoin;

type OkResult = {
    result: 'ok',
    data: Proof
}

type ErrorResult = {
    result: 'error',
    error: string
}

export type VerifyResult = OkResult | ErrorResult

const getNetwork = (networkString: keyof typeof utils.networks): Network | null => {
    return utils.networks[networkString] ?? null;
};

export class Auth47Verifier {
    private readonly bip47: ReturnType<typeof BIP47Factory>;
    private readonly bitcoinjsMessage: ReturnType<typeof bitcoinMessageFactory>;
    private readonly callbackUri: string;

    /**
     * @constructor
     * @param ecc {TinySecp256k1InterfaceJoined} - secp256k1 elliptic curve implementation
     * @param callbackUri {string} - callback URI
     * @throws {Auth47Error} - throws Error on invalid callback URI
     */
    constructor(ecc: TinySecp256k1InterfaceJoined, callbackUri: string) {
        this.bip47 = BIP47Factory(ecc);
        this.bitcoinjsMessage = bitcoinMessageFactory(ecc);
        this.callbackUri = createCallbackUri(callbackUri);
    }

    /**
     * Generate an Auth47URI
     * @param {GenerateURIArgsInput} args
     * @param {string} args.nonce - secure random alphanumeric nonce
     * @param {string} [args.resource] - resource URI
     * @param {number | Date} [args.expires] - expiry (UTC) as a UNIX timestamp or Date object
     * @throws {Auth47Error} - throws Error on invalid args
     * @returns {string}
     */
    generateURI(args: GenerateURIArgs): string {
        validateGenerateUriArgs(args);

        const uri = new URL(`auth47://${args.nonce}`);

        uri.searchParams.set('c', this.callbackUri);

        if (args.expires) uri.searchParams.set('e', args.expires.toString(10));
        if (args.resource) uri.searchParams.set('r', args.resource);

        return decodeURIComponent(uri.toString());
    }

    /**
     * Verify a received Auth47 proof
     * @param {unknown} proof - signed Auth47 proof
     * @param {'bitcoin' | 'testnet' | 'regtest'} networkString=bitcoin - bitcoin network type
     * @returns {({ result: 'ok', data: Proof} | {result: 'error', error: string})} - Successful verification result or unsuccessful result with a message
     */
    verifyProof(proof: unknown, networkString: keyof typeof utils.networks = 'bitcoin'): VerifyResult {
        const network = getNetwork(networkString);

        if (!network) {
            throw new Auth47Error(`Invalid network: ${networkString} (expected "bitcoin", "testnet" or "regtest")`);
        }

        try {
            validateProof(proof);

            const address = 'address' in proof ? proof.address : this.bip47.fromBase58(proof.nym, network).getNotificationAddress();

            const verified = this.bitcoinjsMessage.verify(
                proof.challenge,
                address,
                proof.signature,
                network.messagePrefix
            );

            if(!verified) {
                throw new Auth47Error('invalid signature');
            }

            return {
                result: 'ok',
                data: proof
            };
        } catch (error) {
            return {
                result: 'error',
                error: error instanceof Auth47Error ? error.message : String(error)
            };
        }
    }
}
