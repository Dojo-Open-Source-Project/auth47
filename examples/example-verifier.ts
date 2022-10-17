import { Auth47Verifier } from '../src';

/**
 * A script simulating the operations ran by a Auth47 Verifier
 *   - generation of Auth47URI storing a "challenge"
 *   - verification of proofs sent by the Provers
 */


// Initialize an Auth47Verifier for a Verifier using a soroban channel as its callback URI
const strCallbackUri = 'srbn://123aef4567890aef@samourai.onion';
const verifier = new Auth47Verifier(strCallbackUri);

// Generate an Auth47URI for a given nonce
const uri = verifier.generateURI({'nonce': 'aerezerzerze23131d'});
console.log('URI generated:', uri.toString());

// Here the verifier would send the URI to the Prover
// The Prover would sign the challenge and
// send back the proof to the Verifier through the Callback URI

// Here's the proof received by the Verifier
const proof_received = {
    'auth47_response': '1.0',
    'challenge': 'auth47://aerezerzerze23131d?r=srbn',
    'nym': 'PM8TJTLJbPRGxSbc8EJi42Wrr6QbNSaSSVJ5Y3E4pbCYiTHUskHg13935Ubb7q8tx9GVbh2UuRnBc3WSyJHhUrw8KhprKnn9eDznYGieTzFcwQRya4GA',
    'signature': 'Hyn9En/w5I2LHRNE1iuV+r3pFnSdBj9XZHtXuqZjcAjXdh3IsdUR9c5rTnQibGRb6aowfXY21G+Nyct8mbFD86o='
};

// Verify the proof (use bitcoin network defined as default)
if (verifier.verifyProof(proof_received))
    console.log('Proof is valid');
else
    console.log('Proof is not valid');

