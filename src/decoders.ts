import {createRequire} from 'node:module';
import type * as TD from 'io-ts/Decoder';
import type {pipe as Tpipe} from 'fp-ts/function';

const require = createRequire(import.meta.url);
const D: typeof TD = require('io-ts/Decoder');
const pipe: typeof Tpipe = require('fp-ts/function').pipe;
const {isAlphanumeric} = require('validator');

interface NonEmptyStringBrand {
    readonly NonEmptyString: unique symbol;
}

export type NonEmptyString = string & NonEmptyStringBrand;

export const NonEmptyString: TD.Decoder<unknown, NonEmptyString> = pipe(
    D.string,
    D.refine((s): s is NonEmptyString => s.trim().length > 0, 'non-empty string')
);

interface AlphaNumericStringBrand {
    readonly AlphaNumericString: unique symbol;
}

export type AlphaNumericString = string & AlphaNumericStringBrand;

export const AlphaNumericString: TD.Decoder<unknown, AlphaNumericString> = pipe(
    D.string,
    D.refine((s): s is AlphaNumericString => isAlphanumeric(s), 'alphanumeric string')
);

export const NumberFromDate: TD.Decoder<unknown, number> = ({
    decode: (d) => d instanceof Date ? D.success(Math.floor(d.getTime() / 1000)) : D.failure(d, 'Date object')
});

export const GenerateURIArgsDecoder = pipe(
    D.struct({
        nonce: AlphaNumericString,
    }),
    D.intersect(D.partial({
        resource: NonEmptyString,
        expires: D.union(D.number, NumberFromDate)
    }))
);

