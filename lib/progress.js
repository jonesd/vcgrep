"use strict";

var _ = require('underscore');
var ansi = require('ansi');
var cursor = ansi(process.stdout);

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
  none: NoProgress,
  line: HistogramLineProgress
};

module.exports = {
  options: _.keys(progressOptionsMap),
  defaultOption: 'line',
  fromOption: function fromOption(option) {
    var func = progressOptionsMap[option] || NoProgress;
    return new func();
  }
};
