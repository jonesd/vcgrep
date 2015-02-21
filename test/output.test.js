"use strict";

var SandboxedModule = require('sandboxed-module');
var should = require('should');
var sinon = require('sinon');

function requireOutput(required, globals) {
  var api = SandboxedModule.require('../lib/output', {
    requires: {
      './logger': required&&required.logger||{},
      './lineWriter': required&&required.lineWriter||{}
    },
    globals: globals||{}
  });
  return api;
}

var output = null;
var lineWriterStub = null;
var loggerStub = null;

describe('Output', function() {

  var matches = null;
  var values = null;
  beforeEach(function() {
    lineWriterStub = {};
    loggerStub = {
      log: function(x) {}
    };

    matches = {
      total: 0,
      max: 0,
      keys: {},
      totalFiles: 0,
      processedFiles: 0
    };
    values = [];
  });

  describe('noCompleted', function () {
    it('should do nothing', function () {
      sinon.spy(loggerStub, 'log');
      var output = requireOutput({logger:loggerStub});

      var noCompleted = output.fromOption('none');

      noCompleted(matches, values);

      loggerStub.log.called.should.be.false;
    });
  });

  describe('jsonCompleted', function () {
    it('should write values as json array', function () {
      sinon.spy(loggerStub, 'log');
      var output = requireOutput({logger:loggerStub});

      var jsonCompleted = output.fromOption('json');
      values.push(['key', 1]);

      jsonCompleted(matches, values);

      loggerStub.log.firstCall.args[0].should.equal('[ [ \'key\', 1 ] ]');
    });
  });

  describe('textCompleted', function () {
    it('should write values as lines of key:value', function () {
      sinon.spy(loggerStub, 'log');
      var output = requireOutput({logger:loggerStub});

      var textCompleted = output.fromOption('plain');
      values.push(['first', 10]);
      values.push(['second', 5]);

      textCompleted(matches, values);

      loggerStub.log.firstCall.args[0].should.equal('first: 10');
      loggerStub.log.secondCall.args[0].should.equal('second: 5');
    });
  });

  describe('histogramCompleted', function () {
    it('should write values as lines of bars with key: value', function () {
      var out = '';
      lineWriterStub = {
        write: function(s) {out += s;},
        resetLine: function() {},
        writeBar: function(w, m) {for (var i = 0; i < w; i++) {out += 'X'} out+=' ';},
        nextLine: function() {out += '\n';}
      };

      sinon.spy(lineWriterStub, 'writeBar');
      sinon.spy(lineWriterStub, 'write');
      sinon.spy(lineWriterStub, 'nextLine');
      var output = requireOutput({lineWriter:lineWriterStub});

      var histogramCompleted = output.fromOption('histogram');
      values.push(['first', 10]);
      values.push(['second', 5]);
      matches.max = 10;

      histogramCompleted(matches, values);

      out.should.equal('XXXXXXXXXX first: 10  \nXXXXX second: 5  \n');
    });
  });
});
