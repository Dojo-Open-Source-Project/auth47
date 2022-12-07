import {describe, it, assert} from 'vitest';
import {either} from 'fp-ts';
import {
    VALID_AUTH47_CHALLENGES,
    INVALID_AUTH47_CHALLENGES
} from './test-vectors.js';
import {decodeChallenge} from '../src/custom-decoders';

describe('Auth47Challenge', () => {

    describe('fromString()', () => {
        it('should successfully parse valid challenges', () => {
            for (const uri of VALID_AUTH47_CHALLENGES) {
                assert.deepStrictEqual(decodeChallenge(uri), either.right(uri));
            }
        });

        it('should detect invalid challenges', () => {
            for (const uri of INVALID_AUTH47_CHALLENGES) {
                assert.deepStrictEqual(decodeChallenge(uri[0]), either.left(uri[1]));
            }
        });
    });

});
