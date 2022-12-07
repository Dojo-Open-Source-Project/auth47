import {boolean, either} from 'fp-ts';
import {pipe} from 'fp-ts/function';
import * as D from 'io-ts/Decoder';
import {utils, BIP47Factory} from '@samouraiwallet/bip47';
import {verify} from 'bitcoinjs-message';
import * as ecc from 'tiny-secp256k1';

import {GenerateURIArgsDecoder} from './decoders.js';
import {decodeProof, isNymProof} from './custom-decoders.js';
import {ProofContainer, ValidProofContainer} from './types.js';

const networks = utils.networks;

type Network = typeof networks.bitcoin;

const bip47 = BIP47Factory(ecc);

interface GenerateURIArgs {
    nonce: string;
    resource?: string;
    expires?: number | Date;
}

type OkResult = {
    result: 'ok',
    data: ValidProofContainer['value']
}

type ErrorResult = {
    result: 'error',
    error: string
}

export type VerifyResult = OkResult | ErrorResult

export class Auth47Verifier {
    private callbackUri: string;

    constructor(callbackUri: string) {
        const validatedUri = pipe(
            D.string.decode(callbackUri),
            either.mapLeft(D.draw),
            either.chain((s) => pipe(
                either.tryCatch(() => new URL(s), () => 'invalid URL'),
                either.chain((url) =>
                    ['http:', 'https:', 'srbn:', 'srbns:'].includes(url.protocol) ? either.right(url) : either.left('invalid protocol for callback URI')
                ),
                either.chain((url) => url.hash === '' ? either.right(url) : either.left('hash is forbidden in callback URI')),
                either.chain((url) => url.search === '' ? either.right(url) : either.left('search params are forbidden in callback URI'))
            )),
            either.getOrElseW((e) => {
                throw new Error(e);
            })
        );

        this.callbackUri = decodeURIComponent(validatedUri.toString());
    }

    /**
     * Generate an Auth47URI
     * @param {GenerateURIArgs} args
     * @param {string} args.nonce - secure random alphanumeric nonce
     * @param {string} [args.resource] - resource URI
     * @param {number | Date} [args.expires] - expiry (UTC) as a UNIX timestamp or Date object
     * @throws {Error} - throws Error on invalid args
     * @returns {string}
     */
    generateURI(args: GenerateURIArgs): string {
        return pipe(
            args,
            GenerateURIArgsDecoder.decode,
            either.fold(
                (e) => {
                    throw new Error(D.draw(e));
                },
                (decoded) => {
                    const uri = new URL(`auth47://${decoded.nonce}`);

                    uri.searchParams.set('c', this.callbackUri);

                    if (decoded.expires) uri.searchParams.set('e', decoded.expires.toString(10));
                    if (decoded.resource) uri.searchParams.set('r', decoded.resource);

                    return decodeURIComponent(uri.toString());
                }
            ),
        );
    }

    /**
     * Verify a received Auth47 proof
     * @param {unknown} proof - signed Auth47 proof
     * @param {Network} [network] - bitcoin network type object
     * @returns {({ result: 'ok', data: NymProofType | AddressProofType} | {result: 'error', error: string})} - Successful verification result or unsuccessful result with a message
     */
    verifyProof(proof: unknown, network: Network = networks.bitcoin): VerifyResult {
        return pipe(
            decodeProof(proof),
            either.chain(this.validateProof(network)),
            either.foldW(
                (e) => ({result: 'error', error: e}),
                (proofContainer) => ({result: 'ok', data: proofContainer.value})
            )
        );
    }

    private validateProof = (network: Network) => (proof: ProofContainer): either.Either<string, ValidProofContainer> => pipe(
        isNymProof(proof) ? bip47.fromBase58(proof.value.nym, network).getNotificationAddress() : proof.value.address,
        (notifAddress) => verify(
            proof.value.challenge,
            notifAddress,
            proof.value.signature,
            network.messagePrefix
        ),
        boolean.fold(
            () => either.left('invalid signature'),
            () => either.right(proof as ValidProofContainer)
        )
    );
}
