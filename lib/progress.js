"use strict";

var _ = require('underscore');
var ansi = require('ansi');
var cursor = ansi(process.stdout);
var ctx = require('axel');

var lineWriter = require('./lineWriter');

function NoProgress() {
  if (!(this instanceof NoProgress)) {
    return new NoProgress();
  }
}

NoProgress.prototype.start = function start(matches) {
  // do nothing
};

NoProgress.prototype.refresh = function refresh(matches) {
  // do nothing
};

NoProgress.prototype.startFile = function startFile(file, matches) {
  // do nothing
};

NoProgress.prototype.end = function end(matches) {
  // do nothing
};


function HistogramLineProgress() {
  if (!(this instanceof HistogramLineProgress)) {
    return new NoProgress();
  }
}

HistogramLineProgress.prototype.start = function start(matches) {
  cursor.horizontalAbsolute(0).eraseLine();
};

HistogramLineProgress.prototype.refresh = function refresh(matches) {
  lineWriter.resetLine();
  var sorted = matches.values(20);
  cursor.buffer();
  _.each(sorted, function(p) {
    //console.log(p[0]+': '+p[1]);

    var barWidth = Math.round(p[1] / matches.max * 10);
    writeBar(barWidth, barWidth + 1, lineWriter);

    lineWriter.write(p[0]);
    lineWriter.write(': ');
    lineWriter.write(''+p[1]);
    lineWriter.write('  ');
    lineWriter.write(''+barWidth+' '+matches.max);

  });
  cursor.flush();
};

HistogramLineProgress.prototype.startFile = function startFile(file, matches) {
  // do nothing
};

HistogramLineProgress.prototype.end = function end(matches) {
  cursor.horizontalAbsolute(0).eraseLine();
};


function CardProgress() {
  if (!(this instanceof CardProgress)) {
    return new CardProgress();
  }
  this.pageWidth = process.stdout.columns;
  this.pageHeight = process.stdout.rows;
  this.itemWidth = 20;
  this.entriesWide = Math.floor(this.pageWidth / this.itemWidth);
  this.entriesTall = Math.floor((this.pageHeight - 3) / 4);
  this.entries =  this.entriesWide * this.entriesTall;
  this.lastValues = {};
}

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

CardProgress.prototype.start = function start(matches) {
  ctx.clear();
  ctx.bg(255,255,255);
  ctx.fg(0,0,0);
  ctx.box(1,1, this.pageWidth-1, this.pageHeight-1);

  this._printMatches(matches);
};

CardProgress.prototype.refresh = function refresh(matches) {
  this._printMatches(matches);
};

CardProgress.prototype.startFile = function startFile(file, matches) {
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

CardProgress.prototype.end = function end(matches) {
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



//TODO extract/share
function writeBar(barWidth, total, writer) {
  if (barWidth > 0) {
    cursor.bg.black();
    _.times(barWidth, function (i) {
      writer.write(' ');
    });
  } else {
    cursor.bg.grey();
    writer.write(' ');
  }
  cursor.bg.reset();
  for (var i = 0; i < total - barWidth; i++) {
    writer.write(' ');
  }
}

var progressOptionsMap = {
  card: CardProgress,
  none: NoProgress,
  line: HistogramLineProgress
};

module.exports = {
  options: _.keys(progressOptionsMap),
  defaultOption: 'line',
  noneOption: 'none',
  fromOption: function fromOption(option) {
    var func = progressOptionsMap[option] || NoProgress;
    return new func();
  }
};
