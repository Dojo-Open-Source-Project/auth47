import {describe, it, assert} from 'vitest';
import {Either} from 'effect';
import {Schema, ArrayFormatter} from '@effect/schema';
import {
    VALID_AUTH47_CHALLENGES,
    INVALID_AUTH47_CHALLENGES
} from './test-vectors.js';
import {Challenge} from '../src/decoders.js';

describe('Auth47Challenge', () => {

    describe('fromString()', () => {
        it('should successfully parse valid challenges', () => {
            for (const uri of VALID_AUTH47_CHALLENGES) {
                assert.deepStrictEqual(Schema.decodeUnknownEither(Challenge)(uri), Either.right(uri));
            }
        });

        it('should detect invalid challenges', () => {
            for (const uri of INVALID_AUTH47_CHALLENGES) {
                const decoded = Schema.decodeUnknownEither(Challenge)(uri[0]).pipe(
                    Either.mapLeft(ArrayFormatter.formatErrorSync),
                    Either.mapLeft((e) => e[0].message as string)
                );

                assert.deepStrictEqual(decoded, Either.left(uri[1]));
            }
        });
    });

});
