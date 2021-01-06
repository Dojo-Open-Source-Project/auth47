'use strict'

const { AssertionError } = require('assert');
const assert = require('assert');
const { Auth47URI } = require('../src');
const {
  VALID_AUTH47_URIS,
  INVALID_AUTH47_URIS
} = require('./test-vectors');


describe('Auth47URI', function() {

  describe('fromString()', function() {
    it('should successfully parse valid URIs', function() {
      try {
        for (let uri of VALID_AUTH47_URIS) {
          Auth47URI.fromString(uri);
        }
        assert(true);
      } catch(e) {
        assert(false);
      }
    });

    it('should detect invalid URIs', function() {
      for (let uri of INVALID_AUTH47_URIS) {
        try {
          Auth47URI.fromString(uri);
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
        for (let strUri of VALID_AUTH47_URIS) {
          const uri = Auth47URI.fromString(strUri);
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
