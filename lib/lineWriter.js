"use strict";

var _ = require('underscore');
var ansi = require('ansi');
var cursor = ansi(process.stdout);

var x = 0;
var width = process.stdout.columns;

function write(s) {
  var w = Math.min(width - x, s.length);
  if (w > 0) {
    cursor.write(s.substring(0, w));
    x += w;
  }
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
  x = 0;
};

module.exports.writeBar = function writeBar(barWidth, total) {
  if (barWidth > 0) {
    cursor.bg.black();
    write(strRepeat(' ', barWidth));
  } else {
    cursor.bg.grey();
    write(' ');
  }
  cursor.bg.reset();
  write(strRepeat(' ', total - barWidth));
};

//TODO use library...
function strRepeat(str, qty) {
  if (qty < 1) return '';
  var result = '';
  while (qty > 0) {
    if (qty & 1) {
      result += str;
    }
    qty >>= 1;
    str += str;
  }
  return result;
}
