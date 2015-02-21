"use strict";

var _ = require('underscore');
var ansi = require('ansi');
var cursor = ansi(process.stdout);

var x = 0;
var width = process.stdout.columns;

function write(s) {
  _.each(s, function(c) {
    if (x < width) {
      cursor.write(c);
      x += 1;
    }
  })
}
module.exports.write = write;

module.exports.resetLine = function resetLine() {
  cursor.horizontalAbsolute(0);
  x = 0;
};

module.exports.clearLine = function clearLine() {
  cursor.horizontalAbsolute(0).eraseLine();
  x = 0;
};

module.exports.nextLine = function nextLine() {
  console.log();
};

module.exports.writeBar = function writeBar(barWidth, total) {
  if (barWidth > 0) {
    cursor.bg.black();
    _.times(barWidth, function (i) {
      write(' ');
    });
  } else {
    cursor.bg.grey();
    write(' ');
  }
  cursor.bg.reset();
  for (var i = 0; i < total - barWidth; i++) {
    write(' ');
  }
};

