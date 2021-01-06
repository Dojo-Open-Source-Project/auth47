# auth47-js

A js implementation of the Auth47 protocol.


## Usage

### Initialize a new instance for a Verifier using a HTTPS callback URI

```
const { Auth47Verifier } = require('auth47-js');

const verifier = new Auth47Verifier('https://samourai.io/auth');
```

### Generate an Auth47URI for a given nonce

```
const nonce = Math.random().toString(36).substring(2, 15);
const uri = verifier.generateURI({'nonce': nonce});
console.log('URI generated:', uri.toString());
```

### Verify a proof

```
const proof_received = {
  'auth47_response': '1.0',
  'challenge': 'auth47://aerezerzerze23131d?r=https',
  'nym': 'PM8TJTLJbPRGxSbc8EJ...TzFcwQRya4GA',
  'signature': 'Hyn9En/w5I2LHR...ct8mbFD86o='
};

if (verifier.verifyProof(proof_received))
  console.log('Proof is valid');
else
  console.log('Proof is not valid');
```

### Browser

The recommended method of using this library and bitcoinjs-lib in your browser is through Browserify. If you're familiar with how to use browserify, ignore this and carry on, otherwise, it is recommended to read the tutorial at [https://browserify.org/](https://browserify.org/).

```
<html>
  <head>
    <meta charset="utf-8">
    <title>Test AUTH47 lib</title>
    <script src="libs/auth47-bundle.min.js"></script>
  </head>
  <body>
    <script type="text/javascript">
      const Auth47Verifier = auth47.Auth47Verifier;
      const verifier = new Auth47Verifier('https://samourai.io/auth');

      const nonce = Math.random().toString(36).substring(2, 15);
      console.log('Nonce =', nonce);

      const uri = verifier.generateURI({'nonce': nonce});
      console.log('URI =', uri.toString());

      const proof = {
        'auth47_response': '1.0',
        'challenge': 'auth47://aerezerzerze23131d?r=srbn',
        'nym': 'PM8TJTLJbPRGxSbc8EJi42Wrr6QbNSaSSVJ5Y3E4pbCYiTHUskHg13935Ubb7q8tx9GVbh2UuRnBc3WSyJHhUrw8KhprKnn9eDznYGieTzFcwQRya4GA',
        'signature': 'Hyn9En/w5I2LHRNE1iuV+r3pFnSdBj9XZHtXuqZjcAjXdh3IsdUR9c5rTnQibGRb6aowfXY21G+Nyct8mbFD86o='
      };
      console.log('Proof =', proof);

      const isValidProof = verifier.verifyProof(proof);
      console.log('isValidProof =', isValidProof);
    </script>
  </body>
</html>
```
