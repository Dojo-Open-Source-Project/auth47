import {Effect, pipe} from 'effect';
import * as S from '@effect/schema/Schema';
import * as PR from '@effect/schema/ParseResult';
import {ArrayFormatter} from '@effect/schema';

const base58Regex = /^[1-9A-HJ-NP-Za-km-z]*$/;
const base64Regex = /(?:[\d+/A-Za-z]{4})*(?:[\d+/A-Za-z]{2}==|[\d+/A-Za-z]{3}=|[\d+/A-Za-z]{4})/;

export const NumberFromDate = S.transform(
    S.DateFromSelf,
    S.Number,
    {
        decode: (d) => Math.floor(d.getTime() / 1000),
        encode: (n) => new Date(n * 1000)
    }
).pipe(
    S.nonNaN(),
    S.annotations({message: () => ({ message: 'expected a valid Date', override: true}) })
);

export const NonEmptyString = S.String.pipe(
    S.compose(S.Trim),
    S.minLength(1),
    S.annotations({message: () => ({message: 'expected a non-empty string', override:true}) })
);

export const AlphaNumericString = NonEmptyString.pipe(
    S.pattern(/^[\da-z]+$/i),
    S.annotations({message: () => ({message: 'expected alphanumeric string', override: true}) })
);

const BitcoinMainnetAddress = S.String.pipe(
    S.pattern(/\b(bc(0([02-9ac-hj-np-z]{39}|[02-9ac-hj-np-z]{59})|1[02-9ac-hj-np-z]{8,87})|[13][1-9A-HJ-NP-Za-km-z]{25,35})\b/),
);
const BitcoinTestnetAddress = S.String.pipe(
    S.pattern(/\b(tb(0([02-9ac-hj-np-z]{39}|[02-9ac-hj-np-z]{59})|1[02-9ac-hj-np-z]{8,87})|[2mn][1-9A-HJ-NP-Za-km-z]{25,39})\b/),
);
export const BitcoinAddress = S.Union(BitcoinMainnetAddress, BitcoinTestnetAddress).pipe(
    S.annotations({message: () => ({message: 'expected a valid Bitcoin address', override: true}) })
);

export const IntFromString = S.NumberFromString.pipe(
    S.int(),
    S.annotations({ message: () => ({message:'expected an integer value', override: true})}),
);

export const FutureDateNumber = S.Union(S.Number.pipe(S.nonNaN()), NumberFromDate).pipe(
    S.filter((n) => n * 1000 > Date.now(), {identifier: 'FutureDateNumber', message: () => ({message: 'expected a future date', override: true})})
);

export const GenerateURIArgs = S.Struct({
    nonce: AlphaNumericString,
    resource: S.optional(NonEmptyString),
    expires: S.optional(FutureDateNumber)
});

export type GenerateURIArgsInput = S.Schema.Encoded<typeof GenerateURIArgs>;

export const Signature = NonEmptyString.pipe(
    S.pattern(base64Regex),
    S.annotations({message:() => ({message:'expected a valid signature', override: true})}),
);

export const Nym = NonEmptyString.pipe(
    S.pattern(base58Regex),
    S.startsWith('P'),
    S.length(116),
    S.annotations({message: () => ({message: 'expected a valid Payment code', override: true})}),
);

const ValidCallbackUri = S.String.pipe(S.brand('ValidCallbackUri'));

export type ValidCallbackUri = typeof ValidCallbackUri.Type

export const CallbackUri = S.transformOrFail(
    S.String,
    ValidCallbackUri,
    {
        strict: true,
        decode: (s,_, ast) => pipe(
            Effect.try({
                try: () => new URL(s),
                catch: () => new PR.Type(ast, s,'invalid URL')
            }),
            Effect.flatMap((url) => ['http:', 'https:', 'srbn:', 'srbns:'].includes(url.protocol)
                ? Effect.succeed(url)
                : Effect.fail(new PR.Type(ast, s,'invalid protocol for callback URI'))),
            Effect.flatMap((url) => url.hash === '' ? Effect.succeed(url) : Effect.fail(new PR.Type(ast, s,'hash is forbidden in callback URI'))),
            Effect.flatMap((url) => url.search === '' ? Effect.succeed(url) : Effect.fail(new PR.Type(ast, s,'search params are forbidden in callback URI'))),
            Effect.map(() => new URL(s).toString() as ValidCallbackUri)
        ),
        encode: PR.succeed,
    }
);

export const Resource = pipe(
    S.transformOrFail(
        S.String,
        S.String,
        {
            strict: true,
            decode: (s,_,ast) => pipe(
                Effect.if(s === 'srbn', {
                    onTrue: () => Effect.succeed(s),
                    onFalse: () => pipe(
                        Effect.try({
                            try: () => new URL(s),
                            catch: () => new PR.Type(ast, s,'invalid challenge: expected "srbn" or a valid resource URL')
                        }),
                        Effect.flatMap((url) => url.protocol === 'http:' || url.protocol === 'https:'
                            ? Effect.succeed(url)
                            : Effect.fail(new PR.Type(ast, s,'invalid challenge: expected a valid HTTP(S) protocol'))),
                        Effect.flatMap((url) => url.search === '' ? Effect.succeed(url) : Effect.fail(new PR.Type(ast, s,'invalid challenge: expected empty search param'))),
                        Effect.map(() => s)
                    )
                })
            ),
            encode: PR.succeed
        },
    )
);

export const Expiry =
    S.transformOrFail(
        S.NumberFromString.annotations({message: () => ({message: 'invalid challenge: expiry: expected a numeric string', override: true})}),
        S.Int,
        {
            strict: true,
            decode: (n, _, ast) => (new Date(n * 1000)).getTime() > Date.now()
                ? PR.succeed(n)
                : PR.fail(new PR.Type(ast, n, 'invalid challenge: expired proof')),
            encode: PR.succeed
        }
    );

export const Challenge = S.transformOrFail(
    S.String,
    S.String,
    {
        strict: true,
        decode: (s,_, ast) => Effect.gen(function*() {
            const url = yield* Effect.try({
                try: () => new URL(s),
                catch: () => new PR.Type(ast, s,'invalid challenge: expected a valid URL')
            });

            if (url.protocol !== 'auth47:') {
                yield* Effect.fail(new PR.Type(ast, s,'invalid challenge: invalid protocol, expected "auth47"'));
            }

            if (!S.is(AlphaNumericString)(url.hostname)) {
                yield* Effect.fail(new PR.Type(ast, s,'invalid challenge: invalid nonce'));
            }

            if (url.hash !== '') {
                yield* Effect.fail(new PR.Type(ast, s,'invalid challenge: expected hash to be empty'));
            }

            const obj = Object.fromEntries(url.searchParams.entries());

            if (obj.r === undefined) {
                yield* Effect.fail(new PR.Type(ast, s,'invalid challenge: missing resource'));
            }

            yield* S.decodeUnknown(Resource)(obj.r).pipe(
                Effect.mapError(ArrayFormatter.formatErrorSync),
                Effect.mapError((e) => e[0].message as string),
                Effect.mapError((e) => new PR.Type(ast, s, e))
            );

            if (obj.e !== undefined) {
                yield* S.decodeUnknown(Expiry)(obj.e).pipe(
                    Effect.mapError(ArrayFormatter.formatErrorSync),
                    Effect.mapError((e) => e[0].message as string),
                    Effect.mapError((e) => new PR.Type(ast, s, e))
                );
            }

            if (obj.c !== undefined) {
                yield* Effect.fail(new PR.Type(ast, s,'invalid challenge: expected empty search param'));
            }

            return s;
        }),
        encode: PR.succeed
    }
);

const BaseProof = S.Struct({
    auth47_response: S.Literal('1.0').annotations({message: (issue) => ({message: `"auth47_response": received ${issue.actual}, expected 1.0`, override: true})}),
    challenge: Challenge,
    signature: Signature
});

export const AddressProof = S.Struct({
    ...BaseProof.fields,
    address: BitcoinAddress
});


export const NymProof = S.Struct({
    ...BaseProof.fields,
    nym: Nym
});


export const Proof = S.Union(
    AddressProof.pipe(S.attachPropertySignature('kind', 'AddressProof')),
    NymProof.pipe(S.attachPropertySignature('kind', 'NymProof')),
);

