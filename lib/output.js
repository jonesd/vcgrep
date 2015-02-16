"use strict";

var _ = require('underscore');
var ansi = require('ansi');
var cursor = ansi(process.stdout);


function noCompleted(matches, values) {
  //do nothing
}

function jsonCompleted(matches, values) {
  console.dir(values);
}

function textCompleted(matches, values) {
  _.each(values, function (p) {
    console.log(p[0] + ': ' + p[1]);
  });
}

function histogramCompleted(matches, values) {
  cursor.horizontalAbsolute(0);

  _.each(values, function(p) {
    //console.log(p[0]+': '+p[1]);
    var barWidth = Math.round(p[1] / matches.max * 10);
    writeBar(barWidth, barWidth + 1, cursor);
    cursor.write(p[0]).write(': ').write(''+p[1]).write('  ');
    console.log();
  });
}

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

var outputOptionsMap = {
  none: noCompleted,
  plain: textCompleted,
  json: jsonCompleted,
  histogram: histogramCompleted
};

module.exports = {
  options: _.keys(outputOptionsMap),
  defaultOption: 'histogram',
  noneOption: 'none',
  fromOption: function fromOption(option) {
    var func = outputOptionsMap[option] || noCompleted;
    return func;
  }
};


