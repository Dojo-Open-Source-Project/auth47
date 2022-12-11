import {createRequire} from 'node:module';
import {apply, either, io} from 'fp-ts';
import type * as TG from 'io-ts/Guard';
import type {pipe as Tpipe, flow as Tflow} from 'fp-ts/function';

import {
    AddressProofContainer,
    AlphaNumericString,
    BTCAddress,
    CustomDecoder,
    NonEmptyBase58String,
    NonEmptyBase64String,
    NonEmptyString,
    NymProofContainer, PaymentCode,
    ProofContainer
} from './types.js';

const require = createRequire(import.meta.url);
const G: typeof TG = require('io-ts/Guard');
const pipe: typeof Tpipe = require('fp-ts/function').pipe;
const flow: typeof Tflow = require('fp-ts/function').flow;
const {isBase58, isBase64, isAlphanumeric} = require('validator');

const isBitcoinAddress = (address: string): boolean => {
    const mainnetRegex = /\b(bc(0([02-9ac-hj-np-z]{39}|[02-9ac-hj-np-z]{59})|1[02-9ac-hj-np-z]{8,87})|[13][1-9A-HJ-NP-Za-km-z]{25,35})\b/;
    const testnetRegex = /\b(tb(0([02-9ac-hj-np-z]{39}|[02-9ac-hj-np-z]{59})|1[02-9ac-hj-np-z]{8,87})|[2mn][1-9A-HJ-NP-Za-km-z]{25,39})\b/;

    return mainnetRegex.test(address) || testnetRegex.test(address);
};

const decodeString: CustomDecoder<unknown, string> = (u: unknown) => G.string.is(u) ? either.right(u) : either.left(`expected a string, got ${u}`);

const decodeNumber: CustomDecoder<unknown, number> = (u: unknown) => G.number.is(u) ? either.right(u) : either.left(`expected a number, got ${u}`);

const intFromString: CustomDecoder<unknown, number> = flow(
    decodeString,
    either.map((s) => Number.parseInt(s, 10)),
    either.chain((n) => Number.isNaN(n) ? either.left('expected a numeric string') : either.right(n))
);

export const isNymProof = (proofContainer: ProofContainer): proofContainer is NymProofContainer => proofContainer._tag === 'NymProof';

export const isAddressProof = (proofContainer: ProofContainer): proofContainer is AddressProofContainer => proofContainer._tag === 'AddressProof';

const isNonEmptyString = (str: unknown): str is NonEmptyString => G.string.is(str) && str.length > 0;

const decodeNonEmptyString: CustomDecoder<unknown, NonEmptyString> = (str: unknown) => isNonEmptyString(str) ? either.right(str) : either.left('expected non-empty string');

const isNonEmptyBase58String = (str: unknown): str is NonEmptyBase58String => G.string.is(str) && str.length > 0 && isBase58(str);

const decodeNonEmptyBase58String: CustomDecoder<unknown, NonEmptyBase58String> = (str: unknown) => isNonEmptyBase58String(str) ? either.right(str) : either.left('expected non-empty base58 string');

const isNonEmptyBase64String = (str: unknown): str is NonEmptyBase64String => G.string.is(str) && str.length > 0 && isBase64(str);

const decodeNonEmptyBase64String: CustomDecoder<unknown, NonEmptyBase64String> = (str: unknown) => isNonEmptyBase64String(str) ? either.right(str) : either.left('expected non-empty base64 string');

const isBTCAddress = (str: unknown): str is BTCAddress => isNonEmptyString(str) && isBitcoinAddress(str);

const isAlphaNumericString = (str: unknown): str is AlphaNumericString => G.string.is(str) && isAlphanumeric(str);

const decodeAlphaNumericString: CustomDecoder<unknown, AlphaNumericString> = (str: unknown) => isAlphaNumericString(str) ? either.right(str) : either.left('expected alphanumeric string');

const decodeBTCAddress: CustomDecoder<unknown, BTCAddress> = (str: unknown) => isBTCAddress(str) ? either.right(str) : either.left('expected a valid BTC address');

const isPaymentCode = (str: unknown): str is PaymentCode => isNonEmptyBase58String(str) && str.startsWith('P');

const decodePaymentCode: CustomDecoder<unknown, PaymentCode> = (str: unknown) => isPaymentCode(str) ? either.right(str) : either.left('expected a valid Payment Code');

const decodeUnknownRecord = (u: unknown): either.Either<string, Record<string, unknown>> => G.UnknownRecord.is(u) ? either.right(u) : either.left('expected an object');

const hasProperty = <I extends Record<string, unknown>, Y extends string>(i: I, a: Y): i is I & Record<Y, unknown> => Object.prototype.hasOwnProperty.call(i, a);

/**
 * @internal
 */
const applyStructDecoders = <A extends Record<string, unknown>, F extends Record<string, CustomDecoder<unknown, unknown>>>(decoders: F) =>
    (a: A): { [K in keyof F]: ReturnType<F[K]> } => {
        const out: Record<string, unknown> = {};
        for (const k in decoders) {
            out[k] = hasProperty(a, k) ? decoders[k](a[k]) : either.left(`missing property "${k}"`);
        }

        return out as { [K in keyof F]: ReturnType<F[K]> };
    };

/**
 * @internal
 */
const applyOptionalDecoders = <A extends Record<string, unknown>, F extends Record<string, CustomDecoder<unknown, unknown>>>(decoders: F) =>
    (a: A): { [K in keyof F]: ReturnType<F[K]> } => {
        const out: Record<string, unknown> = {};
        for (const k in decoders) {
            if (hasProperty(a, k)) {
                out[k] = decoders[k](a[k]);
            }
        }

        return out as { [K in keyof F]: ReturnType<F[K]> };
    };

const decodeStruct = <F extends Record<string, CustomDecoder<unknown, unknown>>>(decoders: F) => flow(
    decodeUnknownRecord,
    either.map(applyStructDecoders(decoders)),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    either.chain((b) => apply.sequenceS(either.Applicative)(b as { [K in keyof F]: ReturnType<F[K]> }))
);

const decodePartial = <F extends Record<string, CustomDecoder<unknown, unknown>>>(decoders: F) => flow(
    decodeUnknownRecord,
    either.map(applyOptionalDecoders(decoders)),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    either.chain((b) => apply.sequenceS(either.Applicative)(b as { [K in keyof F]: ReturnType<F[K]> })),
    either.map((b) => b as Partial<typeof b>),
);

const decodeLiteral = <A extends string | number | boolean | null>(literal: A) => (u: unknown) => G.literal(literal).is(u) ? either.right(u) : either.left(`received ${u}, expected ${literal}`);

interface ChallengeBrand {
    readonly Challenge: unique symbol;
}

type Challenge = NonEmptyString & ChallengeBrand;

const decodeResource: CustomDecoder<unknown, unknown> = (u: unknown) => pipe(
    decodeLiteral('srbn')(u),
    either.altW(() => pipe(
        decodeString(u),
        either.chain((str) => either.tryCatch(() => new URL(str), () => 'expected "srbn" or a valid resource URL')),
        either.chain((url) => url.protocol === 'http:' || url.protocol === 'https:' ? either.right(url) : either.left('expected a valid HTTP(S) protocol')), // validate protocol
        either.chain((url) => url.search === '' ? either.right(url) : either.left('expected empty search param')), // validate search
    )),
);

const DateNow: io.IO<number> = () => Date.now();

const decodeExpiry: CustomDecoder<unknown, number> = flow(
    intFromString,
    either.chain((n) => (new Date(n * 1000)).getTime() > DateNow() ? either.right(n) : either.left('expired proof')),
    either.mapLeft((e) => `expiry: ${e}`)
);

export const decodeChallenge: CustomDecoder<unknown, Challenge> = flow(
    decodeNonEmptyString,
    either.chainFirst((str) => pipe(
        either.tryCatch(() => new URL(str), () => 'expected a valid URL'), // parse URL
        either.chain((url) => url.protocol === 'auth47:' ? either.right(url) : either.left('invalid protocol, expected "auth47"')), // validate protocol
        either.chain((url) => isAlphaNumericString(url.hostname) ? either.right(url) : either.left('invalid nonce')), // validate nonce
        either.chain((url) => url.hash === '' ? either.right(url) : either.left('expected hash to be empty')), // validate hash
        either.map((url) => pipe(
            Object.fromEntries(url.searchParams.entries()),
        )),
        either.chainFirst((params) => pipe(
            hasProperty(params, 'r') ? pipe(decodeResource(params.r), either.chain(() => either.right(params))) : either.left('missing resource'),
            either.chain((paramsR) => hasProperty(paramsR, 'e') ? pipe(decodeExpiry(params.e), either.chain(() => either.right(paramsR))) : either.right(paramsR)),
            either.chain((paramsRE) => hasProperty(paramsRE, 'c') ? either.left('unwanted parameter "c" is present') : either.right(paramsRE))
        ))
    )),
    either.mapLeft((e) => `invalid challenge: ${e}`),
    either.map((str) => str as Challenge) // typecast to Challenge
);

export const decodeProof: CustomDecoder<unknown, ProofContainer> = (proof: unknown) => pipe(
    proof,
    decodeStruct({
        auth47_response: flow(decodeLiteral('1.0'), either.mapLeft((e) => `"auth47_response": ${e}`)),
        challenge: flow(decodeChallenge, either.mapLeft((e) => `"challenge": ${e}`)),
        signature: flow(decodeNonEmptyBase64String, either.mapLeft((e) => `"signature": ${e}`))
    }),
    either.chain((decodedRequired) => pipe(
        proof,
        decodePartial({
            address: flow(decodeBTCAddress, either.mapLeft((e) => `"address": ${e}`)),
            nym: flow(decodePaymentCode, either.mapLeft((e) => `"nym": ${e}`))
        }),
        either.map((decodedOptional) => ({...decodedOptional, ...decodedRequired})),
        either.chain((obj) => {
            return hasProperty(obj, 'nym')
                ? either.right({_tag: 'NymProof', value: obj as typeof obj & { nym: NonNullable<typeof obj.nym> }} as ProofContainer)
                : (hasProperty(obj, 'address') ? either.right({
                    _tag: 'AddressProof',
                    value: obj as typeof obj & { nym: NonNullable<typeof obj.address> }
                } as ProofContainer) : either.left('missing property "nym" or "address"'));
        })
    )),
);
