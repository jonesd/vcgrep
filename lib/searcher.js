"use strict";

var _ = require('underscore');
var linebyline = require('linebyline');

function Searcher(re, matches) {
  if (!(this instanceof Searcher)) {
    return new Searcher(re, matches);
  }
  this.re = re;
  this.files = [];
  this.matches = matches;
};

Searcher.prototype.searchAll = function searchAll(workingFiles, updater, callback) {
  this.files = _.union(this.files, workingFiles);
  this._searchFileIndex(0, workingFiles, updater, callback);
};

Searcher.prototype._searchFileIndex = function _searchFileIndex(index, workingFiles, updater, callback) {
  var that = this;
  if (index < workingFiles.length) {
    var file = workingFiles[index];

    that._searchFile(file, updater, function(err, result) {
      //TODO record errors?
      return that._searchFileIndex(index+1, workingFiles, updater, callback);
    });
  } else {
    //console.log('finish', that.matches);
    return callback(null, that.matches);
  }
};

Searcher.prototype._searchFile = function _searchFile(file, updater, callback) {
    var that = this;
    var lastTick = new Date().getTime();
  //TODO emit file start
    var ll = linebyline(file);
    //that.matches.increment('file');
    ll.on('line', function (line, lineNumber) {
      //that.matches.increment('line');
      var matchArray = line.match(that.re);
      if (matchArray && matchArray.length > 0) {
        for (var i = 1; i < matchArray.length; i++) {
          var key = matchArray[i];
          that.matches.increment(key);
          //TODO emit match
        }
        var currentTick = new Date().getTime();
        if (currentTick - lastTick > 50) {
          updater(that.matches);
          lastTick = currentTick;
        }
      }
    })
      .on('error', function (e) {
        console.log('Failed to process ' + file + ' due to: ' + e);
      })
      .on('close', function () {
        //console.log('closed');
        updater(that.matches);
        return callback(null, that.matches);
      });
};

module.exports = Searcher;
