import assert from 'assert';
import {Auth47Challenge} from '../src';
import {
    VALID_AUTH47_CHALLENGES,
    INVALID_AUTH47_CHALLENGES
} from './test-vectors.js';


describe('Auth47Challenge', () => {

    describe('fromString()', () => {
        it('should successfully parse valid challenges', () => {
            for (const uri of VALID_AUTH47_CHALLENGES) {
                assert.doesNotThrow(() => Auth47Challenge.fromString(uri));
            }
        });

        it('should detect invalid challenges', () => {
            for (const uri of INVALID_AUTH47_CHALLENGES) {
                assert.throws(() => {
                    Auth47Challenge.fromString(uri);
                });
            }
        });
    });

    describe('isValid()', () => {
        it('should successfully identify valid challenges', () => {
            for (const strUri of VALID_AUTH47_CHALLENGES) {
                const challenge = Auth47Challenge.fromString(strUri);
                assert.ok(challenge.isValid());
            }
        });
    });

});
