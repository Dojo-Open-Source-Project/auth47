'use strict'

const { AssertionError } = require('assert');
const assert = require('assert');
const { Auth47Parser } = require('../src');
const {
  VALID_AUTH47_URIS,
  INVALID_AUTH47_URIS,
  VALID_AUTH47_CHALLENGES,
  INVALID_AUTH47_CHALLENGES
} = require('./test-vectors');


describe('Auth47Parser', function() {

  describe('parseUri()', function() {
    it('should successfully parse valid URIs', function() {
      try {
        const parser = new Auth47Parser();
        for (let uri of VALID_AUTH47_URIS) {
          parser.parseUri(uri);
        }
        assert(true);
      } catch(e) {
        assert(false);
      }
    });

    it('should detect invalid URIs', function() {
      const parser = new Auth47Parser();
      for (let uri of INVALID_AUTH47_URIS) {
        try {
          parser.parseUri(uri);
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

  describe('parseChallenge()', function() {
    it('should successfully parse valid challenges', function() {
      try {
        const parser = new Auth47Parser();
        for (let uri of VALID_AUTH47_CHALLENGES) {
          parser.parseChallenge(uri);
        }
        assert(true);
      } catch(e) {
        assert(false);
      }
    });

    it('should detect invalid challenges', function() {
      const parser = new Auth47Parser();
      for (let uri of INVALID_AUTH47_CHALLENGES) {
        try {
          parser.parseChallenge(uri);
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

});