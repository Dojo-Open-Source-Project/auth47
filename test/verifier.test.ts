import {describe, it, assert} from 'vitest';
import {
    VALID_AUTH47_PROOFS,
    INVALID_AUTH47_PROOFS, VALID_AUTH47_URIS
} from './test-vectors.js';
import {Auth47Verifier, VerifyResult} from '../src';
import {NymProofType} from '../src/types';

describe('Auth47Verifier', () => {

    describe('generateURI()', () => {
        it('should sucessfully generate valid Auth47 URIs', () => {
            for (const uriTest of VALID_AUTH47_URIS) {
                const verifier = new Auth47Verifier(uriTest.c);

                const uri = verifier.generateURI({nonce: uriTest.nonce, expires: uriTest.e, resource: uriTest.r});

                assert.strictEqual(uri, uriTest.result);
            }
        });

        it('should throw error on invalid callback URI', () => {
            assert.throws(() => new Auth47Verifier('randomstring'), 'invalid URL');
            assert.throws(() => new Auth47Verifier('ftp://samourai.io'), 'invalid protocol for callback URI');
            assert.throws(() => new Auth47Verifier('http://samourai.io/#hash'), 'hash is forbidden in callback URI');
            assert.throws(() => new Auth47Verifier('https://samourai.io/?arg=test'), 'search params are forbidden in callback URI');
        });

        it('should throw error on invalid nonce', () => {
            const verifier = new Auth47Verifier('https://samourai.io/callback');

            assert.throws(() => verifier.generateURI({ nonce: ''}));
            assert.throws(() => verifier.generateURI({ nonce: 'skdvbdhsv436536!'}));
        });

        it('should throw error on invalid expiry', () => {
            const verifier = new Auth47Verifier('https://samourai.io/callback');

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            assert.throws(() => verifier.generateURI({ nonce: 'skdvbdhsv43653', expires: null}));
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            assert.throws(() => verifier.generateURI({ nonce: 'skdvbdhsv43653', expires: '2364365'}));
        });

        it('should throw error on invalid resource', () => {
            const verifier = new Auth47Verifier('https://samourai.io/callback');

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            assert.throws(() => verifier.generateURI({ nonce: 'skdvbdhsv43653', resource: null}));
            assert.throws(() => verifier.generateURI({ nonce: 'skdvbdhsv43653', resource: ''}));
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            assert.throws(() => verifier.generateURI({ nonce: 'skdvbdhsv43653', resource: 2364365}));
        });
    });

    describe('verifyProof()', () => {
        it('should successfully verify valid proofs', () => {
            const verifier = new Auth47Verifier('https://test.com/callback');

            for (const proof of VALID_AUTH47_PROOFS) {
                assert.deepStrictEqual(verifier.verifyProof(proof), {result: 'ok', data: proof as NymProofType});
            }
        });

        it('should successfully detect invalid proofs', () => {
            const verifier = new Auth47Verifier('https://test.com/callback');

            for (const proof of INVALID_AUTH47_PROOFS) {
                assert.deepStrictEqual(verifier.verifyProof(proof[0]), {result: 'error', error: proof[1]} as VerifyResult);
            }
        });
    });
});

