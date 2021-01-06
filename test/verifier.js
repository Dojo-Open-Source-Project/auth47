'use strict'

const { AssertionError } = require('assert');
const assert = require('assert');
const { Auth47Verifier } = require('../src');
const {
  VALID_AUTH47_PROOFS,
  INVALID_AUTH47_PROOFS
} = require('./test-vectors');


describe('Auth47Verifier', function() {

  describe('fromString()', function() {
    it('should successfully verify valid proofs', function() {
      try {
        const verifier = new Auth47Verifier();
        for (let proof of VALID_AUTH47_PROOFS) {
          if (!verifier.verifyProof(proof))
            assert(false);
        }
        assert(true);
      } catch(e) {
        console.log(e)
        assert(false);
      }
    });

    it('should successfully detect invalid proofs', function() {
      try {
        const verifier = new Auth47Verifier();
        for (let proof of INVALID_AUTH47_PROOFS) {
          if (verifier.verifyProof(proof))
            assert(false);
        }
        assert(true);
      } catch(e) {
        if (e instanceof AssertionError) {
          assert(false);
        }
      }
    });

  });

});

