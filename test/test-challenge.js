'use strict'

const { AssertionError } = require('assert');
const assert = require('assert');
const { Auth47Challenge } = require('../src');
const {
  VALID_AUTH47_CHALLENGES,
  INVALID_AUTH47_CHALLENGES
} = require('./vectors');


describe('Auth47Challenge', function() {

  describe('fromString()', function() {
    it('should successfully parse valid challenges', function() {
      try {
        for (let uri of VALID_AUTH47_CHALLENGES) {
          Auth47Challenge.fromString(uri);
        }
        assert(true);
      } catch(e) {
        assert(false);
      }
    });

    it('should detect invalid challenges', function() {
      for (let uri of INVALID_AUTH47_CHALLENGES) {
        try {
          Auth47Challenge.fromString(uri);
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
    it('should successfully identify valid challenges', function() {
      try {
        for (let strUri of VALID_AUTH47_CHALLENGES) {
          const challenge = Auth47Challenge.fromString(strUri);
          if (!challenge.isValid())
            assert(false);
        }
        assert(true);
      } catch(e) {
        assert(false);
      }
    });
  });

});
