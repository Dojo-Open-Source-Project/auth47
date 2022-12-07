import {pipe} from 'fp-ts/function';
import * as D from 'io-ts/Decoder';

import isAlphaNumeric from 'validator/es/lib/isAlphanumeric.js';

interface NonEmptyStringBrand {
    readonly NonEmptyString: unique symbol;
}

export type NonEmptyString = string & NonEmptyStringBrand;

export const NonEmptyString: D.Decoder<unknown, NonEmptyString> = pipe(
    D.string,
    D.refine((s): s is NonEmptyString => s.trim().length > 0, 'non-empty string')
);

interface AlphaNumericStringBrand {
    readonly AlphaNumericString: unique symbol;
}

export type AlphaNumericString = string & AlphaNumericStringBrand;

export const AlphaNumericString: D.Decoder<unknown, AlphaNumericString> = pipe(
    D.string,
    D.refine((s): s is AlphaNumericString => isAlphaNumeric(s), 'alphanumeric string')
);

export const NumberFromDate: D.Decoder<unknown, number> = ({
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

