"use strict";

var _ = require('underscore');
var events = require("events");
var linebyline = require('linebyline');
var util = require('util');

function Searcher(re, matches, ignoreCase) {
  if (!(this instanceof Searcher)) {
    return new Searcher(re, matches, ignoreCase);
  }
  events.EventEmitter.call(this);
  this.re = re;
  this.files = [];
  this.matches = matches;
  this.ignoreCase = ignoreCase;
};
//Searcher.prototype.__proto__ = EventEmitter.prototype;
util.inherits(Searcher, events.EventEmitter);

Searcher.prototype.searchAll = function searchAll(workingFiles, callback) {
  var that = this;
  that.files = _.union(that.files, workingFiles);
  that.matches.totalFiles = that.files.length;
  that.emit('start', that.matches);
  that._searchFileIndex(0, workingFiles, callback);
};

Searcher.prototype._searchFileIndex = function _searchFileIndex(index, workingFiles, callback) {
  var that = this;
  if (index < workingFiles.length) {
    var file = workingFiles[index];

    that._searchFile(file, function(err, result) {
      //TODO record errors?
      return that._searchFileIndex(index+1, workingFiles, callback);
    });
  } else {
    that.emit('end', that.matches);
    return callback(null, that.matches);
  }
};

Searcher.prototype._searchFile = function _searchFile(file, callback) {
    var that = this;
    var lastTick = new Date().getTime();
  //TODO emit file start
    that.matches.processedFiles += 1;
    that.emit('startFile', file, that.matches);
    var ll = linebyline(file);
    ll.on('line', function (line, lineNumber) {
      var matchArray = line.match(that.re);
      if (matchArray && matchArray.length > 0) {
        for (var i = 1; i < matchArray.length; i++) {
          var key = matchArray[i];
          if (that.ignoreCase) {
            key = key.toLowerCase();
          }
          that.matches.increment(key);
          //TODO emit match
        }
        var currentTick = new Date().getTime();
        if (currentTick - lastTick > 50) {
          that.emit('refresh', that.matches);
          lastTick = currentTick;
        }
      }
    })
      .on('error', function (e) {
        console.log('Failed to process ' + file + ' due to: ' + e);
      })
      .on('close', function () {
        //console.log('closed');
        that.emit('refresh', that.matches);
        return callback(null, that.matches);
      });
};

module.exports = Searcher;
