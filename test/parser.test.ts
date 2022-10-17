import assert from 'assert';
import {Auth47Parser} from '../src';
import {
    VALID_AUTH47_URIS,
    INVALID_AUTH47_URIS,
    VALID_AUTH47_CHALLENGES,
    INVALID_AUTH47_CHALLENGES
} from './test-vectors.js';


describe('Auth47Parser', () => {

    describe('parseUri()', () => {
        it('should successfully parse valid URIs', () => {
            const parser = new Auth47Parser();
            for (const uri of VALID_AUTH47_URIS) {
                assert.doesNotThrow(() => parser.parseUri(uri));
            }
        });

        it('should detect invalid URIs', () => {
            const parser = new Auth47Parser();
            for (const uri of INVALID_AUTH47_URIS) {
                assert.throws(() => parser.parseUri(uri));
            }
        });
    });

    describe('parseChallenge()', () => {
        it('should successfully parse valid challenges', () => {
            const parser = new Auth47Parser();
            for (const uri of VALID_AUTH47_CHALLENGES) {
                assert.doesNotThrow(() => parser.parseChallenge(uri));
            }
        });

        it('should detect invalid challenges', () => {
            const parser = new Auth47Parser();
            for (const uri of INVALID_AUTH47_CHALLENGES) {
                assert.throws(() => parser.parseChallenge(uri));
            }
        });
    });

});
