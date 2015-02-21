"use strict";

var should = require('should');

var logger = require('../lib/logger');

describe('Logger', function() {
  it('should have a log function', function() {
    logger.log('a value');
    //TODO assert that it appeared on console...
  });
});