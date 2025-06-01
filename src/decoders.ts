export class Auth47Error extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'Auth47Error';
    }
}

const alphanumericRegex = /^[\da-z]+$/i;
const base58Regex = /^[1-9A-HJ-NP-Za-km-z]*$/;
const base64Regex = /(?:[\d+/A-Za-z]{4})*(?:[\d+/A-Za-z]{2}==|[\d+/A-Za-z]{3}=|[\d+/A-Za-z]{4})/;
const bitcoinAddressMainnetRegex = /\b(bc(0([02-9ac-hj-np-z]{39}|[02-9ac-hj-np-z]{59})|1[02-9ac-hj-np-z]{8,87})|[13][1-9A-HJ-NP-Za-km-z]{25,35})\b/;
const bitcoinAddressTestnetRegex = /\b(tb(0([02-9ac-hj-np-z]{39}|[02-9ac-hj-np-z]{59})|1[02-9ac-hj-np-z]{8,87})|[2mn][1-9A-HJ-NP-Za-km-z]{25,39})\b/;

export function createCallbackUri(callbackUri: string | URL) {
    const url = new URL(callbackUri);

    if (!['http:', 'https:', 'srbn:', 'srbns:'].includes(url.protocol)) {
        throw new Auth47Error('invalid protocol for callback URI');
    }

    if (url.hash !== '') {
        throw new Auth47Error('hash is forbidden in callback URI');
    }

    if (url.search !== '') {
        throw new Auth47Error('search params are forbidden in callback URI');
    }

    return url.toString();
}

export type GenerateURIArgs = {
    nonce: string,
    resource?: string | undefined,
    expires?: number | Date | undefined
}

export function validateGenerateUriArgs(args: GenerateURIArgs): asserts args is GenerateURIArgs {
    if (typeof args !== 'object' || args === null) {
        throw new Auth47Error('Invalid generate URI args');
    }

    if (!('nonce' in args)) {
        throw new Auth47Error('"nonce": missing');
    }

    if (!alphanumericRegex.test(args.nonce)) {
        throw new Auth47Error('"nonce": invalid, expected alphanumeric string');
    }

    if (args.resource != null && (typeof args.resource !== 'string' || args.resource.length === 0)) {
        throw new Auth47Error('"resource": invalid, expected string');
    }

    if (args.expires) {
        if (typeof args.expires === 'number') {
            if (args.expires * 1000 < Date.now()) {
                throw new Auth47Error('"expires": invalid, expected future date');
            }
        } else if (args.expires instanceof Date) {
            args.expires = Math.floor(args.expires.getTime() / 1000);
            if (args.expires * 1000 < Date.now()) {
                throw new Auth47Error('"expires": invalid, expected future date');
            }
        } else {
            throw new Auth47Error('"expires": invalid, expected number or Date');
        }
    }
}

function validateBitcoinAddress(address: unknown) {
    if (typeof address !== 'string') {
        throw new Auth47Error('"address": invalid, expected string');
    }

    if (!bitcoinAddressMainnetRegex.test(address) && !bitcoinAddressTestnetRegex.test(address)) {
        throw new Auth47Error('"address": invalid, expected valid Bitcoin address');
    }
}

function validateNym(nym: unknown) {
    if (typeof nym !== 'string') {
        throw new Auth47Error('"nym": invalid, expected string');
    }

    if (!base58Regex.test(nym)) {
        throw new Auth47Error('"nym": invalid, expected valid Payment code');
    }

    if (nym.length !== 116) {
        throw new Auth47Error('"nym": invalid, expected valid Payment code');
    }

    if (!nym.startsWith('P')) {
        throw new Auth47Error('"nym": invalid, expected valid Payment code');
    }
}

function validateResource(resource: unknown){
    if (typeof resource !== 'string') {
        throw new Auth47Error('"challenge": invalid resource');
    }

    if (resource === 'srbn') return;

    const url = URL.parse(resource);

    if (!url) {
        throw new Auth47Error('"challenge": invalid resource');
    }

    if ((url.protocol !== 'http:' && url.protocol !== 'https:') || url.search !== '') {
        throw new Auth47Error('"challenge": invalid resource');
    }
}

function validateExpiry(expiry: unknown){
    if (typeof expiry !== 'string') {
        throw new Auth47Error('"challenge": invalid expiry');
    }

    const expiryNumber = Number.parseInt(expiry, 10);

    if (Number.isNaN(expiryNumber)) {
        throw new Auth47Error('"challenge": invalid expiry');
    }

    if ((new Date(expiryNumber * 1000)).getTime() < Date.now()) {
        throw new Auth47Error('"challenge": expired proof');
    }
}

export function validateChallenge(challenge: unknown) {
    if (typeof challenge !== 'string') {
        throw new Auth47Error('"challenge": invalid, expected string');
    }

    const url = URL.parse(challenge);

    if (!url) {
        throw new Auth47Error('"challenge": invalid URL');
    }

    if (url.protocol !== 'auth47:') {
        throw new Auth47Error('"challenge": invalid protocol');
    }

    if (!alphanumericRegex.test(url.hostname)) {
        throw new Auth47Error('"challenge": invalid nonce');
    }

    if (url.hash !== '') {
        throw new Auth47Error('"challenge": invalid hash');
    }

    const params = Object.fromEntries(url.searchParams.entries());

    if (params.r === undefined) {
        throw new Auth47Error('"challenge": missing resource');
    }

    validateResource(params.r);
    if (params.e !== undefined) {
        validateExpiry(params.e);
    }

    if (params.c !== undefined) {
        throw new Auth47Error('"challenge": invalid param "c');
    }
}

function validateSignature(signature: unknown) {
    if (!(typeof signature === 'string' && signature.length > 0)) {
        throw new Auth47Error('"signature": invalid, expected string');
    }

    if (!base64Regex.test(signature)) {
        throw new Auth47Error('"signature": invalid, expected base64');
    }
}

type BaseProof = {
    auth47_response: '1.0';
    challenge: string;
    signature: string;
}

type NymProof = BaseProof & {
    nym: string;
}

type AddressProof = BaseProof & {
    address: string;
}

export type Proof = NymProof | AddressProof;

export function validateProof(proof: unknown): asserts proof is Proof {
    if (typeof proof !== 'object' || proof === null) {
        throw new Auth47Error('Invalid proof');
    }

    if (!('auth47_response' in proof)) {
        throw new Auth47Error('"auth47_response": missing, expected 1.0');
    }

    if (proof.auth47_response !== '1.0') {
        throw new Auth47Error('"auth47_response": invalid, expected 1.0');
    }

    if (!('challenge' in proof)) {
        throw new Auth47Error('"challenge": missing');
    }

    if (!('signature' in proof)) {
        throw new Auth47Error('"signature": missing');
    }

    validateChallenge(proof.challenge);
    validateSignature(proof.signature);

    if (!('nym' in proof) && !('address' in proof)) {
        throw new Auth47Error('"nym" or "address" missing');
    }

    if ('nym' in proof) {
        validateNym(proof.nym);
    }
    if ('address' in proof) {
        validateBitcoinAddress(proof.address);
    }
}
