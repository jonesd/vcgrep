"use strict";

var _ = require('underscore');

function Matches() {
  if (!(this instanceof Matches)) {
    return new Matches();
  }
  this.total = 0;
  this.max = 0;
  this.keys = {};
  this.totalFiles = 0;
  this.processedFiles = 0;
};

Matches.prototype.increment = function increment(key) {
  var newValue = (this.keys[key] || 0) + 1;
  if (isNaN(newValue)) {
    //TODO better handling for "reserved" object keys
    //console.log('NaN for key:'+key+' '+this.keys[key]);
    return;
  }
  this.keys[key] = newValue;
  this.max = Math.max(this.max, newValue);
  this.total += 1;
};

Matches.prototype.values = function values(num) {
  var sorted = _.chain(this.keys)
    .pairs()
    .sortBy(function(p) {return p[1]})
    .reverse()
    .value();
  if (num) {
    return _.first(sorted, num);
  } else {
    return sorted;
  }
};


module.exports = Matches;
