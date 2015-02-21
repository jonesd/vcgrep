"use strict";

var _ = require('underscore');
var ctx = require('axel');
var util = require('util');

var lineWriter = require('./lineWriter');

function AbstractProgress() {
}

AbstractProgress.prototype.registerEmitter = function registerEmitter(emitter) {
  var self = this;
  emitter.on('start', function(matches) {self._onStart(matches);});
  emitter.on('refresh', function(matches) {self._onRefresh(matches);});
  emitter.on('startFile', function(file, matches) {self._onStartFile(file, matches);});
  emitter.on('end', function(matches) {self._onEnd(matches);});
};

AbstractProgress.prototype._onRefresh = function _onRefresh(matches) {
  // do nothing
};

AbstractProgress.prototype._onStart = function _onStart(matches) {
  // do nothing
};

AbstractProgress.prototype._onStartFile = function _onStartFile(file, matches) {
  // do nothing
};

AbstractProgress.prototype._onEnd = function _onEnd(matches) {
  // do nothing
};

function NoProgress(emitter) {
  if (!(this instanceof NoProgress)) {
    return new NoProgress(emitter);
  }

  this.registerEmitter(emitter);
}

util.inherits(NoProgress, AbstractProgress);

function HistogramLineProgress(emitter) {
  if (!(this instanceof HistogramLineProgress)) {
    return new HistogramLineProgress(emitter);
  }

  this.registerEmitter(emitter);
}

util.inherits(HistogramLineProgress, AbstractProgress);

HistogramLineProgress.prototype._onStart = function _onStart(matches) {
  lineWriter.clearLine();
};

HistogramLineProgress.prototype._onRefresh = function _onRefresh(matches) {
  lineWriter.resetLine();
  var sorted = matches.values(20);
  _.each(sorted, function(p) {
    //console.log(p[0]+': '+p[1]);

    var barWidth = Math.round(p[1] / matches.max * 10);
    lineWriter.writeBar(barWidth, barWidth + 1);

    lineWriter.write(''+p[0]+': '+p[1]+'  '+barWidth+' '+matches.max);
  });
};

HistogramLineProgress.prototype._onEnd = function _onEnd(matches) {
  lineWriter.clearLine();
};


function CardProgress(emitter) {
  if (!(this instanceof CardProgress)) {
    return new CardProgress(emitter);
  }
  var self = this;
  self.pageWidth = process.stdout.columns;
  self.pageHeight = process.stdout.rows;
  self.itemWidth = 20;
  self.entriesWide = Math.floor(self.pageWidth / self.itemWidth);
  self.entriesTall = Math.floor((self.pageHeight - 3) / 4);
  self.entries =  self.entriesWide * self.entriesTall;
  self.lastValues = {};

  self.registerEmitter(emitter);
}

util.inherits(CardProgress, AbstractProgress);

CardProgress.prototype._printString = function _printString(x, y, text, width) {
  var s = text.substr(0, width);
  ctx.text(x, y, s);
  ctx.box(x+ s.length, y, width - s.length, 1);
};

CardProgress.prototype._printMatches = function _printMatches(matches) {
  var start = Date.now();
  var that = this;
  var sorted = matches.values(that.entries);
  var newValues = {};
  _.each(sorted, function(p, i) {
    newValues[p[0]] = p[1];
    var y = Math.floor(i / that.entriesWide) * 4 + 1;
    var x = (i % that.entriesWide)* that.itemWidth + 1;
    var barWidth = Math.round(p[1] / matches.max * (that.itemWidth-1));

    ctx.bg(255, 255, 255);
    var strong = (!that.lastValues[p[0]] || that.lastValues[p[0]] !== p[1]);
    if (strong) {
      ctx.fg(0,0,0);
    } else {
      ctx.fg(128,128,128);
    }
    that._printString(x, y, p[0], that.itemWidth - 1);
    that._printString(x, y+1, ''+p[1], that.itemWidth - 1);
    if (strong) {
        ctx.bg(0,0,0);
    } else {
      ctx.bg(128,128,128);
    }
    ctx.box(x, y+2, barWidth, 1);
    ctx.bg(255, 255, 255);
    ctx.box(x+barWidth, y+2, that.itemWidth - 1 - barWidth, 1);
  });
  that.lastValues = newValues;
  ctx.fg(0,0,0);
  //this._printString(1, this.pageHeight -1, ''+(Date.now() - start), this.pageWidth);
};

CardProgress.prototype._onStart = function _onStart(matches) {
  var that = this;
  ctx.clear();
  ctx.bg(255,255,255);
  ctx.fg(0,0,0);
  ctx.box(1,1, that.pageWidth-1, that.pageHeight-1);

  that._printMatches(matches);
};

CardProgress.prototype._onRefresh = function _onRefresh(matches) {
  this._printMatches(matches);
};

CardProgress.prototype._onStartFile = function _onStartFile(file, matches) {
  this._printMatches(matches);
  ctx.fg(0,0,0);
  var barWidth = Math.round(matches.processedFiles / matches.totalFiles * 10);
  ctx.bg(0,0,0);
  ctx.box(1, this.pageHeight - 2, barWidth, 1);
  ctx.bg(128, 128, 128);
  ctx.box(1+barWidth, this.pageHeight - 2, 10 - barWidth, 1);
  ctx.bg(255,255,255);
  this._printString(12, this.pageHeight -2, file+'...', this.pageWidth-11);
};

CardProgress.prototype._onEnd = function _onEnd(matches) {
  this.lastValues = {};
  this._printMatches(matches);
  ctx.fg(0,0,0);

  var barWidth = Math.round(matches.processedFiles / matches.totalFiles * 10);
  ctx.bg(0,0,0);
  ctx.box(1, this.pageHeight - 2, barWidth, 1);
  ctx.bg(128, 128, 128);
  ctx.box(1+barWidth, this.pageHeight - 2, 10 - barWidth, 1);
  ctx.bg(255,255,255);
  this._printString(12, this.pageHeight -2, 'Done. '+matches.totalFiles+' files. '+matches.total+' matches. '+ _.keys(matches.keys).length+' unique.', this.pageWidth-11);
  //cursor.horizontalAbsolute(0).eraseLine();
};



var progressOptionsMap = {
  card: CardProgress,
  none: NoProgress,
  line: HistogramLineProgress
};

module.exports = {
  options: _.keys(progressOptionsMap),
  defaultOption: 'line',
  noneOption: 'none',
  fromOption: function fromOption(option, emitter) {
    var func = progressOptionsMap[option] || NoProgress;
    return new func(emitter);
  }
};
