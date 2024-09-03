import {BIP47Factory, TinySecp256k1Interface} from '@samouraiwallet/bip47';
import * as utils from '@samouraiwallet/bip47/utils';
import {bitcoinMessageFactory} from '@samouraiwallet/bitcoinjs-message';
import {pipe, Either, Boolean} from 'effect';
import * as S from '@effect/schema/Schema';
import {ArrayFormatter} from '@effect/schema';

import {CallbackUri, GenerateURIArgs, GenerateURIArgsInput, Proof, ValidCallbackUri} from './decoders.js';

const networks = utils.networks;

type TinySecp256k1InterfaceJoined = TinySecp256k1Interface & Parameters<typeof bitcoinMessageFactory>[0]

type Network = typeof networks.bitcoin;

type OkResult = {
    result: 'ok',
    data: typeof Proof.Type
}

type ErrorResult = {
    result: 'error',
    error: string
}

export type VerifyResult = OkResult | ErrorResult

const getNetwork = (networkString: keyof typeof utils.networks): Either.Either<Network, string> => {
    switch (networkString) {
        case 'bitcoin':
            return Either.right(networks.bitcoin);
        case 'testnet':
            return Either.right(networks.testnet);
        case 'regtest':
            return Either.right(networks.regtest);
        default:
            return Either.left('Invalid bitcoin network');
    }
};

export class Auth47Verifier {
    private readonly bip47: ReturnType<typeof BIP47Factory>;
    private readonly bitcoinjsMessage: ReturnType<typeof bitcoinMessageFactory>;
    private readonly callbackUri: ValidCallbackUri;

    /**
     * @constructor
     * @param ecc {TinySecp256k1InterfaceJoined} - secp256k1 elliptic curve implementation
     * @param callbackUri {string} - callback URI
     * @throws {Error} - throws Error on invalid callback URI
     */
    constructor(ecc: TinySecp256k1InterfaceJoined, callbackUri: string) {
        this.bip47 = BIP47Factory(ecc);
        this.bitcoinjsMessage = bitcoinMessageFactory(ecc);
        this.callbackUri = S.decodeUnknownEither(CallbackUri)(callbackUri).pipe(
            Either.mapLeft(ArrayFormatter.formatErrorSync),
            Either.mapLeft((e) => e[0].message as string),
            Either.match({
                onLeft: (e) => { throw e; },
                onRight: (uri) => uri
            })
        );
    }

    /**
     * Generate an Auth47URI
     * @param {GenerateURIArgsInput} args
     * @param {string} args.nonce - secure random alphanumeric nonce
     * @param {string} [args.resource] - resource URI
     * @param {number | Date} [args.expires] - expiry (UTC) as a UNIX timestamp or Date object
     * @throws {Error} - throws Error on invalid args
     * @returns {string}
     */
    generateURI(args: GenerateURIArgsInput): string {
        return pipe(
            args,
            S.decodeUnknownSync(GenerateURIArgs),
            (decoded) => {
                const uri = new URL(`auth47://${decoded.nonce}`);

                uri.searchParams.set('c', this.callbackUri);

                if (decoded.expires) uri.searchParams.set('e', decoded.expires.toString(10));
                if (decoded.resource) uri.searchParams.set('r', decoded.resource);

                return decodeURIComponent(uri.toString());
            }
        );
    }

    /**
     * Verify a received Auth47 proof
     * @param {unknown} proof - signed Auth47 proof
     * @param {'bitcoin' | 'testnet' | 'regtest'} networkString=bitcoin - bitcoin network type
     * @returns {({ result: 'ok', typeof Proof.Type} | {result: 'error', error: string})} - Successful verification result or unsuccessful result with a message
     */
    verifyProof(proof: unknown, networkString: keyof typeof utils.networks = 'bitcoin'): VerifyResult {
        return pipe(
            S.decodeUnknownEither(Proof)(proof),
            Either.mapLeft(ArrayFormatter.formatErrorSync),
            Either.mapLeft((e) => e[0].message as string),
            Either.flatMap(this.validateProof(networkString)),
            Either.match({
                onLeft: (e) => ({result: 'error', error: e}),
                onRight: (proof) => ({result: 'ok', data: proof})}
            )
        );
    }

    private validateProof = (networkString: keyof typeof utils.networks) => (proof: typeof Proof.Type): Either.Either<typeof Proof.Type, string> => pipe(
        getNetwork(networkString),
        Either.flatMap((network) => pipe(
            proof.kind === 'NymProof'
                ? this.bip47.fromBase58(proof.nym, network).getNotificationAddress()
                : proof.address,
            (notifAddress) => this.bitcoinjsMessage.verify(
                proof.challenge,
                notifAddress,
                proof.signature,
                network.messagePrefix
            ),
            Boolean.match({
                onFalse: () => Either.left('invalid signature'),
                onTrue: () => Either.right(proof)}
            )
        )),
    );
}
