"use strict";

var _ = require('underscore');
var linebyline = require('linebyline');

function Searcher(re, matches, ignoreCase) {
  if (!(this instanceof Searcher)) {
    return new Searcher(re, matches, ignoreCase);
  }
  this.re = re;
  this.files = [];
  this.matches = matches;
  this.ignoreCase = ignoreCase;
};

Searcher.prototype.searchAll = function searchAll(workingFiles, progress, callback) {
  this.files = _.union(this.files, workingFiles);
  this.matches.totalFiles = this.files.length;
  progress.start(this.matches);
  this._searchFileIndex(0, workingFiles, progress, callback);
};

Searcher.prototype._searchFileIndex = function _searchFileIndex(index, workingFiles, progress, callback) {
  var that = this;
  if (index < workingFiles.length) {
    var file = workingFiles[index];

    that._searchFile(file, progress, function(err, result) {
      //TODO record errors?
      return that._searchFileIndex(index+1, workingFiles, progress, callback);
    });
  } else {
    //console.log('finish', that.matches);
    progress.end(that.matches);
    return callback(null, that.matches);
  }
};

Searcher.prototype._searchFile = function _searchFile(file, progress, callback) {
    var that = this;
    var lastTick = new Date().getTime();
  //TODO emit file start
    that.matches.processedFiles += 1;
    progress.startFile(file, that.matches);
    var ll = linebyline(file);
    //that.matches.increment('file');
    ll.on('line', function (line, lineNumber) {
      //that.matches.increment('line');
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
          progress.refresh(that.matches);
          lastTick = currentTick;
        }
      }
    })
      .on('error', function (e) {
        console.log('Failed to process ' + file + ' due to: ' + e);
      })
      .on('close', function () {
        //console.log('closed');
        progress.refresh(that.matches);
        return callback(null, that.matches);
      });
};

module.exports = Searcher;
