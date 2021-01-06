'use strict'

const { AssertionError } = require('assert');
const assert = require('assert');
const { SorobanURI } = require('../../src/soroban');
const {
  VALID_SOROBAN_URIS,
  INVALID_SOROBAN_URIS
} = require('../test-vectors');


describe('SorobanURI', function() {

  describe('fromString()', function() {
    it('should successfully parse valid URIs', function() {
      try {
        for (let uri of VALID_SOROBAN_URIS) {
          SorobanURI.fromString(uri);
        }
        assert(true);
      } catch(e) {
        assert(false);
      }
    });

    it('should detect invalid URIs', function() {
      for (let uri of INVALID_SOROBAN_URIS) {
        try {
          SorobanURI.fromString(uri);
          assert(false);
        } catch(e) {
          if (e instanceof AssertionError) {
            assert(false)
          }
        }
      }
      assert(true);
    });
  });

  describe('isValid()', function() {
    it('should successfully identify valid URIs', function() {
      try {
        for (let strUri of VALID_SOROBAN_URIS) {
          const uri = SorobanURI.fromString(strUri);
          if (!uri.isValid())
            assert(false);
        }
        assert(true);
      } catch(e) {
        assert(false);
      }
    });
  });

});
