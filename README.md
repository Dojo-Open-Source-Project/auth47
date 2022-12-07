# @samouraiwallet/auth47

A JS implementation of the Auth47 protocol.


## Usage

### Initialize a new instance for a Verifier using a HTTPS callback URI

```js
import crypto from 'crypto'
import { Auth47Verifier } from '@samouraiwallet/auth47';

const verifier = new Auth47Verifier('https://samourai.io/auth');
```

### Generate an Auth47URI for a given nonce

```js
// Generate random nonce
const nonce = crypto.randomBytes(12).toString('hex');
const uri = verifier.generateURI({'nonce': nonce});
console.log('URI generated:', uri);
```

### Verify a proof

```js
const proof_received = {
  'auth47_response': '1.0',
  'challenge': 'auth47://aerezerzerze23131d?r=https://samourai.io/auth',
  'nym': 'PM8TJTLJbPRGxSbc8EJ...TzFcwQRya4GA',
  'signature': 'Hyn9En/w5I2LHR...ct8mbFD86o='
};

// Verify the proof (use bitcoin network defined as default)
const verifiedProof = verifier.verifyProof(proof_received);

if (verifiedProof.result === 'ok') {
  console.log('Proof is valid');
}
else {
  // log given error
  console.log(verifiedProof.error);
}
```
