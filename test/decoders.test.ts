import {describe, it, assert} from 'vitest';
import * as S from '@effect/schema/Schema';
import {NumberFromDate, NonEmptyString, AlphaNumericString, BitcoinAddress, IntFromString, FutureDateNumber, GenerateURIArgs} from '../src/decoders.js';

describe('decoders module', () => {
    describe('NumberFromDate', () => {
        it('decodes valid Date into number', () => {
            const date = new Date();
            const decoded = S.decodeSync(NumberFromDate)(date);

            assert.strictEqual(decoded, Math.floor(date.getTime() / 1000));
        });

        it('throws on invalid date', () => {
            const invalidDate = new Date('invalid date');
            assert.throws(() => S.decodeSync(NumberFromDate)(invalidDate), 'expected a valid Date');
        });
    });

    describe('NonEmptyString', () => {
        it('should decode a non-empty string', () => {
            const decodedNonEmptyString = S.decodeSync(NonEmptyString)('test');
            assert.strictEqual(decodedNonEmptyString, 'test');
        });

        it('throws on empty string', () => {
            const emptyString = '';
            assert.throws(() => S.decodeSync(NonEmptyString)(emptyString), 'expected a non-empty string');
        });
    });

    describe('AlphaNumericString', () => {
        it('decoded a valid alphanumeric string', () => {
            const validAlphaNumericString = 'abc123';
            const decodedAlphaNumericString = S.decodeSync(AlphaNumericString)(validAlphaNumericString);
            assert.strictEqual(decodedAlphaNumericString, validAlphaNumericString);
        });

        it('throws on empty string', () => {
            const emptyString = '';
            assert.throws(() => S.decodeSync(NonEmptyString)(emptyString), 'expected a non-empty string');
        });

        it('throws on non-alphanumeric string', () => {
            const nonAlphaNumericString = 'abc123!';
            assert.throws(() => S.decodeSync(AlphaNumericString)(nonAlphaNumericString), 'expected alphanumeric string');
        });
    });

    describe('BitcoinAddress', () => {
        it('should decode a valid Bitcoin P2WPKH address', () => {
            const validBitcoinAddress = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq';
            const decodedBitcoinAddress = S.decodeSync(BitcoinAddress)(validBitcoinAddress);
            assert.strictEqual(decodedBitcoinAddress, validBitcoinAddress);
        });

        it('should decode a valid Bitcoin P2SH address', () => {
            const validBitcoinP2WSHAddress = '3JZq4atUahhuA9rLhXLMhhTo133J9rF97j';
            const decodedBitcoinP2WSHAddress = S.decodeSync(BitcoinAddress)(validBitcoinP2WSHAddress);
            assert.strictEqual(decodedBitcoinP2WSHAddress, validBitcoinP2WSHAddress);
        });

        it('should decode a valid Bitcoin P2PKH address', () => {
            const validBitcoinP2PKHAddress = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
            const decodedBitcoinP2PKHAddress = S.decodeSync(BitcoinAddress)(validBitcoinP2PKHAddress);
            assert.strictEqual(decodedBitcoinP2PKHAddress, validBitcoinP2PKHAddress);
        });

        it('throws on invalid Bitcoin address', () => {
            const invalidBitcoinAddress = 'invalidAddress';
            assert.throws(() => S.decodeSync(BitcoinAddress)(invalidBitcoinAddress), 'expected a valid Bitcoin address');
        });

        it('should decode a valid Bitcoin P2WPKH address on testnet', () => {
            const validBitcoinTestnetAddress = 'tb1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq';
            const decodedBitcoinTestnetAddress = S.decodeSync(BitcoinAddress)(validBitcoinTestnetAddress);
            assert.strictEqual(decodedBitcoinTestnetAddress, validBitcoinTestnetAddress);
        });

        it('should decode a valid Bitcoin P2SH address on testnet', () => {
            const validBitcoinTestnetAddress = '2NBFNJTktNa7GZusGbDbGKRZTxdK9VVez3n';
            const decodedBitcoinTestnetAddress = S.decodeSync(BitcoinAddress)(validBitcoinTestnetAddress);
            assert.strictEqual(decodedBitcoinTestnetAddress, validBitcoinTestnetAddress);
        });

        it('should decode a valid Bitcoin P2PKH address on testnet', () => {
            const validBitcoinTestnetAddress = 'mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn';
            const decodedBitcoinTestnetAddress = S.decodeSync(BitcoinAddress)(validBitcoinTestnetAddress);
            assert.strictEqual(decodedBitcoinTestnetAddress, validBitcoinTestnetAddress);
        });
    });

    describe('IntFromString', () => {
        it('should decode a valid integer from string', () => {
            const validIntString = '123';
            const decodedInt = S.decodeSync(IntFromString)(validIntString);
            assert.strictEqual(decodedInt, 123);
        });

        it('throws on invalid integer string', () => {
            const invalidIntString = 'abc';
            assert.throws(() => S.decodeSync(IntFromString)(invalidIntString), 'expected an integer value');
        });

        it('throws on float string', () => {
            const nonNumericString = '23.645';
            assert.throws(() => S.decodeSync(IntFromString)(nonNumericString), 'expected an integer value');
        });

        it('throws on empty string', () => {
            assert.throws(() => S.decodeSync(IntFromString)(''), 'expected an integer value');
        });
    });

    describe('FutureDateNumber', () => {
        it('should decode a valid future date from number', () => {
            const futureDate = Math.floor((Date.now() / 1000)) + 10000;
            const decodedFutureDate = S.decodeSync(FutureDateNumber)(futureDate);
            assert.strictEqual(decodedFutureDate, futureDate);
        });

        it('should decode a valid future date from Date', () => {
            const futureDate = new Date('2050-08-11');
            const decodedFutureDate = S.decodeSync(FutureDateNumber)(futureDate);
            assert.strictEqual(decodedFutureDate, Math.floor(futureDate.getTime() / 1000));
        });

        it('throws on past date from number', () => {
            const pastDate = Math.floor((Date.now() / 1000)) - 10000;
            assert.throws(() => S.decodeSync(FutureDateNumber)(pastDate), 'expected a future date');
        });

        it('throws on past date from Date', () => {
            const pastDate = new Date('2018-08-11');
            assert.throws(() => S.decodeSync(FutureDateNumber)(pastDate), 'expected a future date');
        });
    });

    describe('GenerateURIArgs', () => {
        it('should decode GenerateURIArgs', () => {
            const validGenerateURIArgs = {
                nonce: 'abc123',
                resource: 'test',
                expires: 2212085794
            };
            const decodedGenerateURIArgs = S.decodeSync(GenerateURIArgs)(validGenerateURIArgs);
            assert.deepStrictEqual(decodedGenerateURIArgs, validGenerateURIArgs);
        });

        it('should decode GenerateURIArgs with just nonce', () => {
            const validGenerateURIArgs = {
                nonce: 'abc123',
            };
            const decodedGenerateURIArgs = S.decodeSync(GenerateURIArgs)(validGenerateURIArgs);
            assert.deepStrictEqual(decodedGenerateURIArgs, validGenerateURIArgs);
        });

        it('should decode GenerateURIArgs with just nonce and resource', () => {
            const validGenerateURIArgs = {
                nonce: 'abc123',
                resource: 'test'
            };
            const decodedGenerateURIArgs = S.decodeSync(GenerateURIArgs)(validGenerateURIArgs);
            assert.deepStrictEqual(decodedGenerateURIArgs, validGenerateURIArgs);
        });

        it('should decode GenerateURIArgs with Date', () => {
            const date = 2212085794;
            const validGenerateURIArgs = {
                nonce: 'abc123',
                resource: 'test',
                expires: new Date(date * 1000)
            };
            const decodedGenerateURIArgs = S.decodeSync(GenerateURIArgs)(validGenerateURIArgs);
            // @ts-expect-error TS2322
            validGenerateURIArgs.expires = date;
            // @ts-expect-error TS2345
            assert.deepStrictEqual(decodedGenerateURIArgs, validGenerateURIArgs);
        });

        it('throws on invalid nonce', () => {
            const invalidGenerateURIArgs = {
                nonce: '',
                resource: 'test',
                expires: 2212085794
            };
            assert.throws(() => S.decodeSync(GenerateURIArgs)(invalidGenerateURIArgs));
        });

        it('throws on invalid resource', () => {
            const invalidGenerateURIArgs = {
                nonce: 'abc123',
                resource: '',
                expires: 2212085794
            };
            assert.throws(() => S.decodeSync(GenerateURIArgs)(invalidGenerateURIArgs));
        });

        it('throws on invalid expires', () => {
            const invalidGenerateURIArgs = {
                nonce: 'abc123',
                resource: 'test',
                expires: Number.NaN
            };
            assert.throws(() => S.decodeSync(GenerateURIArgs)(invalidGenerateURIArgs));
        });

        it('throws on expired date', () => {
            const invalidGenerateURIArgs = {
                nonce: 'abc123',
                resource: 'test',
                expires: 1630435200
            };
            assert.throws(() => S.decodeSync(GenerateURIArgs)(invalidGenerateURIArgs));
        });
    });
});
