import assert from 'assert';
import {Auth47Verifier} from '../src';
import {
    VALID_AUTH47_PROOFS,
    INVALID_AUTH47_PROOFS
} from './test-vectors.js';

describe('Auth47Verifier', () => {

    describe('fromString()', () => {
        it('should successfully verify valid proofs', () => {
            const verifier = new Auth47Verifier();
            for (const proof of VALID_AUTH47_PROOFS) {
                assert.ok(verifier.verifyProof(proof));
            }
        });
        it('should successfully detect invalid proofs', () => {
            const verifier = new Auth47Verifier();
            for (const proof of INVALID_AUTH47_PROOFS) {
                assert.ok(!verifier.verifyProof(proof));
            }
        });
    });
});

