export const VALID_SOROBAN_URIS = [
    'srbn://123aef4567890aef',
    'srbn://123aef4567890aef@samourai.onion',
    'srbn://123aef4567890aef@samourai.onion/rpc',
    'srbns://123aef4567890aef@samourai.io',
];

export const INVALID_SOROBAN_URIS = [
    'ftp://123aef4567890aef',   // invalid scheme
    'srbn://123aef4',           // channel with invalid length
    'srbn://1G3aef4567890aef',  // channel with non hex value
    'srbn://123aef4567890aef@samourai.onion/rpc?arg=test', // gateway uri with unsupported query
    'srbn://123aef4567890aef@samourai.onion/rpc#hash',
];

export const VALID_AUTH47_URIS = [
    {nonce: 'aZrzsdfsfs343432sdf', c: 'srbn://123aef4567890aef@samourai.onion/rpc', result: 'auth47://aZrzsdfsfs343432sdf?c=srbn://123aef4567890aef@samourai.onion/rpc'},
    {nonce: 'aZrzsdfsfs343432sdf', c: 'srbn://123aef4567890aef@samourai.onion', result: 'auth47://aZrzsdfsfs343432sdf?c=srbn://123aef4567890aef@samourai.onion'},
    {nonce: 'aZrzsdfsfs343432sdf', c: 'srbn://123aef4567890aef', result: 'auth47://aZrzsdfsfs343432sdf?c=srbn://123aef4567890aef'},
    {nonce: 'aZrzsdfsfs343432sdf', c: 'srbns://123aef4567890aef@samourai.io', result: 'auth47://aZrzsdfsfs343432sdf?c=srbns://123aef4567890aef@samourai.io'},
    {nonce: 'aZrzsdfsfs343432sdf', c: 'srbn://123aef4567890aef@samourai.onion', r: 'srbn', result: 'auth47://aZrzsdfsfs343432sdf?c=srbn://123aef4567890aef@samourai.onion&r=srbn'},
    {
        nonce: 'aZrzsdfsfs343432sdf',
        c: 'srbn://123aef4567890aef@samourai.onion',
        e: 2208988800,
        result: 'auth47://aZrzsdfsfs343432sdf?c=srbn://123aef4567890aef@samourai.onion&e=2208988800'
    },
    {
        nonce: 'aZrzsdfsfs343432sdf',
        c: 'srbn://123aef4567890aef@samourai.onion',
        e: new Date('2025-08-25'),
        result: 'auth47://aZrzsdfsfs343432sdf?c=srbn://123aef4567890aef@samourai.onion&e=1756080000'
    },
    {
        nonce: 'aZrzsdfsfs343432sdf',
        c: 'srbn://123aef4567890aef@samourai.onion',
        r: 'srbn',
        e: 2208988800,
        result: 'auth47://aZrzsdfsfs343432sdf?c=srbn://123aef4567890aef@samourai.onion&e=2208988800&r=srbn'
    },
    {nonce: 'aZrzsdfsfs343432sdf', c: 'http://samourai.io', result: 'auth47://aZrzsdfsfs343432sdf?c=http://samourai.io/'},
    {nonce: 'aZrzsdfsfs343432sdf', c: 'https://samourai.io', result: 'auth47://aZrzsdfsfs343432sdf?c=https://samourai.io/'},
    {
        nonce: 'aZrzsdfsfs343432sdf',
        c: 'https://samourai.io',
        r: 'https://samourai.io/resource1',
        result: 'auth47://aZrzsdfsfs343432sdf?c=https://samourai.io/&r=https://samourai.io/resource1'
    },
    {nonce: 'aZrzsdfsfs343432sdf', c: 'https://samourai.io', e: 2208988800, result: 'auth47://aZrzsdfsfs343432sdf?c=https://samourai.io/&e=2208988800'},
    {
        nonce: 'aZrzsdfsfs343432sdf',
        c: 'https://samourai.io',
        r: 'https://samourai.io/resource1',
        e: 2208988800,
        result: 'auth47://aZrzsdfsfs343432sdf?c=https://samourai.io/&e=2208988800&r=https://samourai.io/resource1'
    }
];

export const INVALID_AUTH47_URIS = [
    'auth48://aZrzsdfsfs343432sdf?c=srbn://123aef4567890aef@samourai.onion', // invalid scheme
    'auth47://a!rzsdfsfs343432sdf?c=srbn://123aef4567890aef@samourai.onion', // nonce with invalid character
    'auth47://aZrzsdfsfs343432sdf', // missing callback URI
    'auth47://aZrzsdfsfs343432sdf?c=ftp://samourai.io', // unsupported protocol for callback URI
    'auth47://aZrzsdfsfs343432sdf?c=http://samourai.io?arg=notgood', // callback URI with a query
    'auth47://aZrzsdfsfs343432sdf?c=http://samourai.io/test#hash', //
    'auth47://aZrzsdfsfs343432sdf?c=https://samourai.io&e=timestamp', // invalid expiry param
    'auth47://aZrzsdfsfs343432sdf?c=https://samourai.io&r=ftp://samourai.io', // unsupported protocol for resource URI
    'auth47://aZrzsdfsfs343432sdf?c=https://samourai.io&r=srbn://123aef4567890aef',
    'auth47://aZrzsdfsfs343432sdf?c=https://samourai.io&r=srbns',
];

export const VALID_AUTH47_CHALLENGES = [
    'auth47://aZrzsdfsfs343432sdf?r=srbn',
    'auth47://aZrzsdfsfs343432sdf?r=srbn&e=2208988800',
    'auth47://aZrzsdfsfs343432sdf?r=http://samourai.io',
    'auth47://aZrzsdfsfs343432sdf?r=https://samourai.io',
    'auth47://aZrzsdfsfs343432sdf?r=https://samourai.io/resource1',
    'auth47://aZrzsdfsfs343432sdf?r=https://samourai.io&e=2208988800',
];


export const INVALID_AUTH47_CHALLENGES = [
    ['', 'invalid challenge: expected non-empty string'], // empty challenge
    ['auth48://aZrzsdfsfs343432sdf?r=srbn', 'invalid challenge: invalid protocol, expected "auth47"'], // invalid scheme
    ['auth47://a!rzsdfsfs343432sdf?r=srbn', 'invalid challenge: invalid nonce'], // nonce with invalid character
    ['auth47://aZrzsdfsfs343432sdf', 'invalid challenge: missing resource'], // missing resource URI
    ['auth47://aZrzsdfsfs343432sdf?r=ftp://samourai.io', 'invalid challenge: expected a valid HTTP(S) protocol'], // unsupported protocol for resource URI
    ['auth47://aZrzsdfsfs343432sdf?r=http://samourai.io?arg=notgood', 'invalid challenge: expected empty search param'], // resource URI with a query
    ['auth47://aZrzsdfsfs343432sdf?r=http://samourai.io/test#hash', 'invalid challenge: expected hash to be empty'], // hash
    ['auth47://aZrzsdfsfs343432sdf?r=https://samourai.io&e=timestamp', 'invalid challenge: expiry: expected a numeric string'], // invalid expiry param
    ['auth47://aZrzsdfsfs343432sdf?r=srbn://123aef4567890aef', 'invalid challenge: expected a valid HTTP(S) protocol'],
    ['auth47://aZrzsdfsfs343432sdf?r=srbns', 'invalid challenge: expected "srbn" or a valid resource URL'],
];

export const VALID_AUTH47_PROOFS = [
    {
        'auth47_response': '1.0',
        'challenge': 'auth47://aerezerzerze23131d?r=srbn',
        'nym': 'PM8TJTLJbPRGxSbc8EJi42Wrr6QbNSaSSVJ5Y3E4pbCYiTHUskHg13935Ubb7q8tx9GVbh2UuRnBc3WSyJHhUrw8KhprKnn9eDznYGieTzFcwQRya4GA',
        'signature': 'Hyn9En/w5I2LHRNE1iuV+r3pFnSdBj9XZHtXuqZjcAjXdh3IsdUR9c5rTnQibGRb6aowfXY21G+Nyct8mbFD86o='
    },
    {
        'auth47_response': '1.0',
        'challenge': 'auth47://b467136609ad51c37105e2d3?r=http://37.143.131.230:8095&e=1670716800',
        'nym': 'PM8TJcJxC23rSYYcop8tbmLHA1BbjpaRGDuyvoZDhneoEqqh6tZ1FMwnaW8UyYbYh3XNRzRzqcd1Nt4aYzfpJn72UadKPJ7kBh8VjbjTxCvqHTweNLwV',
        'signature': 'IChLIrib5c864y8UOB9vWlFvU5jGRAsvyVdJOsSZn7dRQXAbnY/d/0CUKiV9RitdXadySuG+NdxzfvEgxmwDBt4=',
    },
    {
        'auth47_response': '1.0',
        'challenge': 'auth47://b467136609ad51c37105e2d3?r=http://37.143.131.230:8095',
        'address': '1C8tWg58TkbpefZjfHqiytAu45aefAvTEv',
        'signature': 'IH+jidKULo1buU67eMK4EY+B4xsXZP1FQFO0PiaaOT/PQylLVk/EYmIPAuy8cyhEvp3Kzyt5oaX4qTq8gBUSrLA=',
    }
];

export const INVALID_AUTH47_PROOFS = [
    [{  // invalid version
        'auth47_response': '2.0',
        'challenge': 'auth47://aerezerzerze23131d?r=srbn',
        'nym': 'PM8TJTLJbPRGxSbc8EJi42Wrr6QbNSaSSVJ5Y3E4pbCYiTHUskHg13935Ubb7q8tx9GVbh2UuRnBc3WSyJHhUrw8KhprKnn9eDznYGieTzFcwQRya4GA',
        'signature': 'Hyn9En/w5I2LHRNE1iuV+r3pFnSdBj9XZHtXuqZjcAjXdh3IsdUR9c5rTnQibGRb6aowfXY21G+Nyct8mbFD86o='
    }, '"auth47_response": received 2.0, expected 1.0'],
    [{  // invalid challenge
        'auth47_response': '1.0',
        'challenge': 'auth47://aerezerzerze23131d?c=srbn',
        'nym': 'PM8TJTLJbPRGxSbc8EJi42Wrr6QbNSaSSVJ5Y3E4pbCYiTHUskHg13935Ubb7q8tx9GVbh2UuRnBc3WSyJHhUrw8KhprKnn9eDznYGieTzFcwQRya4GA',
        'signature': 'Hyn9En/w5I2LHRNE1iuV+r3pFnSdBj9XZHtXuqZjcAjXdh3IsdUR9c5rTnQibGRb6aowfXY21G+Nyct8mbFD86o='
    }, '"challenge": invalid challenge: missing resource'],
    [{  // wrong payment code
        'auth47_response': '1.0',
        'challenge': 'auth47://aerezerzerze23131d?r=srbn',
        'nym': 'PM8TJS2JxQ5ztXUpBBRnpTbcUXbUHy2T1abfrb3KkAAtMEGNbey4oumH7Hc578WgQJhPjBxteQ5GHHToTYHE3A1w6p7tU6KSoFmWBVbFGjKPisZDbP97',
        'signature': 'Hyn9En/w5I2LHRNE1iuV+r3pFnSdBj9XZHtXuqZjcAjXdh3IsdUR9c5rTnQibGRb6aowfXY21G+Nyct8mbFD86o='
    }, 'invalid signature'],
    [{  // expired proof
        'auth47_response': '1.0',
        'challenge': 'auth47://aerezerzerze23131d?r=srbn&e=100000',
        'nym': 'PM8TJTLJbPRGxSbc8EJi42Wrr6QbNSaSSVJ5Y3E4pbCYiTHUskHg13935Ubb7q8tx9GVbh2UuRnBc3WSyJHhUrw8KhprKnn9eDznYGieTzFcwQRya4GA',
        'signature': 'H6EfUR//wweVWEjJvCcKJdQEtVLeZTJKPzurTojyaJsXVNtUS+AqkYmuWcoFavmJ167Ahrpw022pNHJwtI25Lyg='
    }, '"challenge": invalid challenge: expiry: expired proof']
];
