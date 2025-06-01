import {describe, it, assert} from 'vitest';
import {
    Auth47Error,
    createCallbackUri,
    validateGenerateUriArgs,
    validateChallenge,
    validateProof,
    type GenerateURIArgs
} from '../src/decoders.js';
import { VALID_AUTH47_CHALLENGES, INVALID_AUTH47_CHALLENGES } from './test-vectors.js';

describe('Auth47Error', () => {
    it('should create an error with the correct name and message', () => {
        const error = new Auth47Error('test message');
        assert.strictEqual(error.name, 'Auth47Error');
        assert.strictEqual(error.message, 'test message');
    });
});

describe('createCallbackUri', () => {
    it('should accept valid http URLs', () => {
        assert.doesNotThrow(() => createCallbackUri('http://example.com'));
    });

    it('should accept valid https URLs', () => {
        assert.doesNotThrow(() => createCallbackUri('https://example.com'));
    });

    it('should accept valid srbn URLs', () => {
        assert.doesNotThrow(() => createCallbackUri('srbn://123aef4567890aef'));
    });

    it('should accept valid srbns URLs', () => {
        assert.doesNotThrow(() => createCallbackUri('srbns://123aef4567890aef@samourai.io'));
    });

    it('should throw for URLs with unsupported protocols', () => {
        assert.throws(() => createCallbackUri('ftp://example.com'), 'invalid protocol for callback URI');
    });

    it('should throw for URLs with hash', () => {
        assert.throws(() => createCallbackUri('http://example.com#hash'), 'hash is forbidden in callback URI');
    });

    it('should throw for URLs with search parameters', () => {
        assert.throws(() => createCallbackUri('http://example.com?param=value'), 'search params are forbidden in callback URI');
    });
});

describe('validateGenerateUriArgs', () => {
    it('should throw for non-object args', () => {
        // @ts-expect-error - Testing invalid input
        assert.throws(() => validateGenerateUriArgs('not-an-object'), 'Invalid generate URI args');
        // @ts-expect-error - Testing invalid input
        assert.throws(() => validateGenerateUriArgs(null), 'Invalid generate URI args');
        // @ts-expect-error - Testing invalid input
        // eslint-disable-next-line unicorn/no-useless-undefined
        assert.throws(() => validateGenerateUriArgs(undefined), 'Invalid generate URI args');
    });

    it('should throw when nonce is missing', () => {
        assert.throws(() => validateGenerateUriArgs({} as GenerateURIArgs), '"nonce": missing');
    });

    it('should throw when nonce is not alphanumeric', () => {
        assert.throws(() => validateGenerateUriArgs({ nonce: 'invalid-nonce!' }), '"nonce": invalid, expected alphanumeric string');
    });

    it('should throw when resource is invalid', () => {
        assert.throws(() => validateGenerateUriArgs({ nonce: 'validnonce', resource: '' }), '"resource": invalid, expected string');
        // @ts-expect-error - Testing invalid input
        assert.throws(() => validateGenerateUriArgs({ nonce: 'validnonce', resource: 123 }), '"resource": invalid, expected string');
    });

    it('should throw when expires is invalid', () => {
        const pastDate = new Date(Date.now() - 3600000); // 1 hour ago
        assert.throws(() => validateGenerateUriArgs({ nonce: 'validnonce', expires: pastDate }), '"expires": invalid, expected future date');

        const pastTimestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
        assert.throws(() => validateGenerateUriArgs({ nonce: 'validnonce', expires: pastTimestamp }), '"expires": invalid, expected future date');

        // @ts-expect-error - Testing invalid input
        assert.throws(() => validateGenerateUriArgs({ nonce: 'validnonce', expires: 'not-a-date' }), '"expires": invalid, expected number or Date');
    });

    it('should accept valid args', () => {
        assert.doesNotThrow(() => validateGenerateUriArgs({ nonce: 'validnonce' }));
        assert.doesNotThrow(() => validateGenerateUriArgs({ nonce: 'validnonce', resource: 'http://example.com' }));

        const futureDate = new Date(Date.now() + 3600000); // 1 hour in the future
        assert.doesNotThrow(() => validateGenerateUriArgs({ nonce: 'validnonce', expires: futureDate }));

        const futureTimestamp = Math.floor(Date.now() / 1000) + 3600; // 1 hour in the future
        assert.doesNotThrow(() => validateGenerateUriArgs({ nonce: 'validnonce', expires: futureTimestamp }));
    });
});

describe('validateChallenge', () => {
    it('should successfully validate valid challenges', () => {
        for (const uri of VALID_AUTH47_CHALLENGES) {
            assert.doesNotThrow(() => validateChallenge(uri));
        }
    });

    it('should throw for invalid challenges', () => {
        for (const uri of INVALID_AUTH47_CHALLENGES) {
            assert.throws(() => validateChallenge(uri[0]), uri[1]);
        }
    });

    it('should throw for non-string challenges', () => {
        assert.throws(() => validateChallenge(123), '"challenge": invalid, expected string');
        assert.throws(() => validateChallenge(null), '"challenge": invalid, expected string');
        // eslint-disable-next-line unicorn/no-useless-undefined
        assert.throws(() => validateChallenge(undefined), '"challenge": invalid, expected string');
    });

    it('should throw for challenges with c parameter', () => {
        assert.throws(() => validateChallenge('auth47://aZrzsdfsfs343432sdf?r=srbn&c=value'), '"challenge": invalid param "c');
    });
});

describe('validateProof', () => {
    it('should throw for non-object proofs', () => {
        assert.throws(() => validateProof('not-an-object'), 'Invalid proof');
        assert.throws(() => validateProof(null), 'Invalid proof');
        // eslint-disable-next-line unicorn/no-useless-undefined
        assert.throws(() => validateProof(undefined), 'Invalid proof');
    });

    it('should throw when auth47_response is missing', () => {
        assert.throws(() => validateProof({}), '"auth47_response": missing, expected 1.0');
    });

    it('should throw when auth47_response is not 1.0', () => {
        assert.throws(() => validateProof({ auth47_response: '2.0' }), '"auth47_response": invalid, expected 1.0');
    });

    it('should throw when challenge is missing', () => {
        assert.throws(() => validateProof({ auth47_response: '1.0' }), '"challenge": missing');
    });

    it('should throw when signature is missing', () => {
        assert.throws(() => validateProof({
            auth47_response: '1.0',
            challenge: 'auth47://aZrzsdfsfs343432sdf?r=srbn'
        }), '"signature": missing');
    });

    it('should throw when signature is not a string', () => {
        assert.throws(() => validateProof({
            auth47_response: '1.0',
            challenge: 'auth47://aZrzsdfsfs343432sdf?r=srbn',
            signature: 123
        }), '"signature": invalid, expected string');
    });

    it('should throw when signature is an empty string', () => {
        assert.throws(() => validateProof({
            auth47_response: '1.0',
            challenge: 'auth47://aZrzsdfsfs343432sdf?r=srbn',
            signature: ''
        }), '"signature": invalid, expected string');
    });

    it('should throw when signature is not base64', () => {
        assert.throws(() => validateProof({
            auth47_response: '1.0',
            challenge: 'auth47://aZrzsdfsfs343432sdf?r=srbn',
            signature: '!@#$%^&*()',
            nym: 'PM8TJTLJbPRGxSbc8EJi42Wrr6QbNSaSSVJ5Y3E4pbCYiTHUskHg13935Ubb7q8tx9GVbh2UuRnBc3WSyJHhUrw8KhprKnn9eDznYGieTzFcwQRya4GA'
        }), '"signature": invalid, expected base64');
    });

    it('should throw when both nym and address are missing', () => {
        assert.throws(() => validateProof({
            auth47_response: '1.0',
            challenge: 'auth47://aZrzsdfsfs343432sdf?r=srbn',
            signature: 'SGVsbG8gV29ybGQ='
        }), '"nym" or "address" missing');
    });

    it('should throw when nym is invalid', () => {
        assert.throws(() => validateProof({
            auth47_response: '1.0',
            challenge: 'auth47://aZrzsdfsfs343432sdf?r=srbn',
            signature: 'SGVsbG8gV29ybGQ=',
            nym: 'invalid-nym'
        }), '"nym": invalid, expected valid Payment code');
    });

    it('should throw when address is invalid', () => {
        assert.throws(() => validateProof({
            auth47_response: '1.0',
            challenge: 'auth47://aZrzsdfsfs343432sdf?r=srbn',
            signature: 'SGVsbG8gV29ybGQ=',
            address: 'invalid-address'
        }), '"address": invalid, expected valid Bitcoin address');
    });

    it('should validate a proof with both nym and address', () => {
        assert.doesNotThrow(() => validateProof({
            auth47_response: '1.0',
            challenge: 'auth47://aZrzsdfsfs343432sdf?r=srbn',
            signature: 'SGVsbG8gV29ybGQ=',
            nym: 'PM8TJTLJbPRGxSbc8EJi42Wrr6QbNSaSSVJ5Y3E4pbCYiTHUskHg13935Ubb7q8tx9GVbh2UuRnBc3WSyJHhUrw8KhprKnn9eDznYGieTzFcwQRya4GA',
            address: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'
        }));
    });
});
