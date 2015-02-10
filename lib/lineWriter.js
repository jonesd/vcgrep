"use strict";

var _ = require('underscore');
var ansi = require('ansi');
var cursor = ansi(process.stdout);

var x = 0;
var width = process.stdout.columns;

var write = function(s) {
  _.each(s, function(c) {
    if (x < width) {
      cursor.write(c);
      x += 1;
    }
  })
};

module.exports.write = write;

var resetLine = function() {
  cursor.horizontalAbsolute(0);
  x = 0;
}

module.exports.resetLine = resetLine;
