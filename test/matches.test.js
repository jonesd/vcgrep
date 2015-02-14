"use strict";

var should = require('should');

var Matches = require('../lib/matches');

describe('Matches', function() {
  var matches;
  beforeEach(function() {
    matches = new Matches();
  });

  describe('init', function() {
    it('should be initialized to zero and empty', function() {
      matches.max.should.be.eql(0);
      matches.total.should.be.eql(0);
      matches.keys.should.be.empty;
    });
  });

  describe('increment', function() {
    it('should add if unknown key', function() {
      matches.increment('testKey');
      matches.keys['testKey'].should.eql(1);
    });
    it('should increment value for known key', function() {
      matches.increment('testKey');
      matches.increment('testKey');
      matches.keys['testKey'].should.eql(2);
    });
    it('should keep total of all increments', function() {
      matches.increment('key0');
      matches.increment('key0');
      matches.increment('key1');
      matches.total.should.eql(3);
    });
    it('should remember maximum value of any key', function() {
      matches.increment('key0');
      matches.increment('key0');
      matches.increment('key1');
      matches.max.should.eql(2);
    });
    it('should ignore reserved object fields... until can better handle it', function() {
      matches.increment('toString');
      matches.total.should.eql(0);
    });
    it('should support reserved object field names as keys');
  });

  describe('values', function() {
    it('should be empty initially', function() {
      matches.values().should.be.empty;
    });
    it('should provide pairs of keys and values sorted largest first', function() {
        matches.increment('key0');
        matches.increment('key1');
        matches.increment('key1');
        matches.values().should.eql([['key1', 2], ['key0', 1]]);
    });
    it('should limit to first n values', function() {
      matches.increment('key0');
      matches.increment('key1');
      matches.increment('key1');
      matches.values(1).should.eql([['key1', 2]]);
    });
  });
});