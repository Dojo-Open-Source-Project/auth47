import assert from 'assert';
import {SorobanURI} from '../../src/soroban';
import {
    VALID_SOROBAN_URIS,
    INVALID_SOROBAN_URIS
} from '../test-vectors.js';


describe('SorobanURI', () => {

    describe('fromString()', () => {
        it('should successfully parse valid URIs', () => {
            for (const uri of VALID_SOROBAN_URIS) {
                assert.doesNotThrow(() => SorobanURI.fromString(uri));
            }
        });

        it('should detect invalid URIs', () => {
            for (const uri of INVALID_SOROBAN_URIS) {
                assert.throws(() => SorobanURI.fromString(uri));
            }
        });
    });

    describe('isValid()', () => {
        it('should successfully identify valid URIs', () => {
            for (const strUri of VALID_SOROBAN_URIS) {
                const uri = SorobanURI.fromString(strUri);
                assert.ok(uri.isValid());
            }
        });
    });

});
