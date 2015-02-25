"use strict";

var SandboxedModule = require('sandboxed-module');
var should = require('should');
var sinon = require('sinon');

function requireLineWriter(required, globals) {
  var api = SandboxedModule.require('../lib/lineWriter', {
    requires: {
    },
    globals: globals||{}
  });
  return api;
}

var lineWriter = null;
var stdoutStub = null;
var globals = null;

describe('LineWriter', function() {
  var out = null;
  beforeEach(function() {
    out = '';
    stdoutStub = {
      columns: 10,
      write: function(s) {out += s;},
      on: function() {},
      listeners: function() {return [];}
    };
    globals = {
      process: {
        stdout: stdoutStub
      }
    };
  });
  describe('Write', function() {
    it('should write all characters if end of line not reached', function() {
      lineWriter = requireLineWriter({}, globals);
      lineWriter.write('short');
      out.should.equal('short');
    });
    it('should cut off characters once end of line is reached', function() {
      lineWriter = requireLineWriter({}, globals);
      lineWriter.write('0123456789ABCD');
      out.should.equal('0123456789');
    });
    it('should support cutoff at 1', function() {
      lineWriter = requireLineWriter({}, globals);
      lineWriter.write('012345678');
      lineWriter.write('9ABCD');
      out.should.equal('0123456789');
    });
    it('should record x between calls', function() {
      lineWriter = requireLineWriter({}, globals);
      lineWriter.write('0123456789');
      lineWriter.write('ABCD');
      out.should.equal('0123456789');
    });
    it('resetLine should reset x position and accept more write chars', function() {
      lineWriter = requireLineWriter({}, globals);
      lineWriter.write('0123456789');
      lineWriter.resetLine();
      lineWriter.write('ABCD');
      out.should.equal('0123456789ABCD');
    });

  });
});