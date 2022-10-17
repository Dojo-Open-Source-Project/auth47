import assert from 'assert';
import {Auth47URI} from '../src';
import {
    VALID_AUTH47_URIS,
    INVALID_AUTH47_URIS
} from './test-vectors.js';


describe('Auth47URI', () => {

    describe('fromString()', () => {
        it('should successfully parse valid URIs', () => {
            for (const uri of VALID_AUTH47_URIS) {
                assert.doesNotThrow(() => Auth47URI.fromString(uri));
            }
        });

        it('should detect invalid URIs', () => {
            for (const uri of INVALID_AUTH47_URIS) {
                assert.throws(() => Auth47URI.fromString(uri));
            }
        });
    });

    describe('isValid()', () => {
        it('should successfully identify valid URIs', () => {
            for (const strUri of VALID_AUTH47_URIS) {
                const uri = Auth47URI.fromString(strUri);
                assert.ok(uri.isValid());
            }
        });
    });

});
