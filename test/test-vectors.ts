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
    'auth47://aZrzsdfsfs343432sdf?c=srbn://123aef4567890aef@samourai.onion/rpc',
    'auth47://aZrzsdfsfs343432sdf?c=srbn://123aef4567890aef@samourai.onion',
    'auth47://aZrzsdfsfs343432sdf?c=srbn://123aef4567890aef',
    'auth47://aZrzsdfsfs343432sdf?c=srbns://123aef4567890aef@samourai.io',
    'auth47://aZrzsdfsfs343432sdf?c=srbn://123aef4567890aef@samourai.onion&r=srbn',
    'auth47://aZrzsdfsfs343432sdf?c=srbn://123aef4567890aef@samourai.onion&e=2208988800',
    'auth47://aZrzsdfsfs343432sdf?c=srbn://123aef4567890aef@samourai.onion&e=2208988800&r=srbn',
    'auth47://aZrzsdfsfs343432sdf?c=http://samourai.io',
    'auth47://aZrzsdfsfs343432sdf?c=https://samourai.io',
    'auth47://aZrzsdfsfs343432sdf?c=https://samourai.io&r=https://samourai.io/resource1',
    'auth47://aZrzsdfsfs343432sdf?c=https://samourai.io&e=2208988800',
    'auth47://aZrzsdfsfs343432sdf?c=https://samourai.io&e=2208988800&r=https://samourai.io/resource1',
];

export const INVALID_AUTH47_URIS = [
    'auth48://aZrzsdfsfs343432sdf?c=srbn://123aef4567890aef@samourai.onion', // invalid scheme
    'auth47://a#rzsdfsfs343432sdf?c=srbn://123aef4567890aef@samourai.onion', // nonce with invalid character
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
    'auth48://aZrzsdfsfs343432sdf?r=srbn', // invalid scheme
    'auth47://a#rzsdfsfs343432sdf?r=srbn', // nonce with invalid character
    'auth47://aZrzsdfsfs343432sdf', // missing resource URI
    'auth47://aZrzsdfsfs343432sdf?r=ftp://samourai.io', // unsupported protocol for resource URI
    'auth47://aZrzsdfsfs343432sdf?r=http://samourai.io?arg=notgood', // resource URI with a query
    'auth47://aZrzsdfsfs343432sdf?r=http://samourai.io/test#hash', //
    'auth47://aZrzsdfsfs343432sdf?r=https://samourai.io&e=timestamp', // invalid expiry param
    'auth47://aZrzsdfsfs343432sdf?r=srbn://123aef4567890aef',
    'auth47://aZrzsdfsfs343432sdf?r=srbns',
];

export const VALID_AUTH47_PROOFS = [
    {
        'auth47_response': '1.0',
        'challenge': 'auth47://aerezerzerze23131d?r=srbn',
        'nym': 'PM8TJTLJbPRGxSbc8EJi42Wrr6QbNSaSSVJ5Y3E4pbCYiTHUskHg13935Ubb7q8tx9GVbh2UuRnBc3WSyJHhUrw8KhprKnn9eDznYGieTzFcwQRya4GA',
        'signature': 'Hyn9En/w5I2LHRNE1iuV+r3pFnSdBj9XZHtXuqZjcAjXdh3IsdUR9c5rTnQibGRb6aowfXY21G+Nyct8mbFD86o='
    },
];

export const INVALID_AUTH47_PROOFS = [
    {  // invalid version
        'auth47_response': '2.0',
        'challenge': 'auth47://aerezerzerze23131d?r=srbn',
        'nym': 'PM8TJTLJbPRGxSbc8EJi42Wrr6QbNSaSSVJ5Y3E4pbCYiTHUskHg13935Ubb7q8tx9GVbh2UuRnBc3WSyJHhUrw8KhprKnn9eDznYGieTzFcwQRya4GA',
        'signature': 'Hyn9En/w5I2LHRNE1iuV+r3pFnSdBj9XZHtXuqZjcAjXdh3IsdUR9c5rTnQibGRb6aowfXY21G+Nyct8mbFD86o='
    }, {  // invalid challenge
        'auth47_response': '1.0',
        'challenge': 'auth47://aerezerzerze23131d?c=srbn',
        'nym': 'PM8TJTLJbPRGxSbc8EJi42Wrr6QbNSaSSVJ5Y3E4pbCYiTHUskHg13935Ubb7q8tx9GVbh2UuRnBc3WSyJHhUrw8KhprKnn9eDznYGieTzFcwQRya4GA',
        'signature': 'Hyn9En/w5I2LHRNE1iuV+r3pFnSdBj9XZHtXuqZjcAjXdh3IsdUR9c5rTnQibGRb6aowfXY21G+Nyct8mbFD86o='
    }, {  // wrong payment code
        'auth47_response': '1.0',
        'challenge': 'auth47://aerezerzerze23131d?r=srbn',
        'nym': 'PM8TJS2JxQ5ztXUpBBRnpTbcUXbUHy2T1abfrb3KkAAtMEGNbey4oumH7Hc578WgQJhPjBxteQ5GHHToTYHE3A1w6p7tU6KSoFmWBVbFGjKPisZDbP97',
        'signature': 'Hyn9En/w5I2LHRNE1iuV+r3pFnSdBj9XZHtXuqZjcAjXdh3IsdUR9c5rTnQibGRb6aowfXY21G+Nyct8mbFD86o='
    }, {  // expired proof
        'auth47_response': '1.0',
        'challenge': 'auth47://aerezerzerze23131d?r=srbn&e=100000',
        'nym': 'PM8TJTLJbPRGxSbc8EJi42Wrr6QbNSaSSVJ5Y3E4pbCYiTHUskHg13935Ubb7q8tx9GVbh2UuRnBc3WSyJHhUrw8KhprKnn9eDznYGieTzFcwQRya4GA',
        'signature': 'H6EfUR//wweVWEjJvCcKJdQEtVLeZTJKPzurTojyaJsXVNtUS+AqkYmuWcoFavmJ167Ahrpw022pNHJwtI25Lyg='
    }
];
