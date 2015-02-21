"use strict";

var _ = require('underscore');
var util = require('util');

var lineWriter = require('./lineWriter');
var logger = require('./logger');

function noCompleted(matches, values) {
  //do nothing
}

function jsonCompleted(matches, values) {
  logger.log(util.inspect(values));
}

function textCompleted(matches, values) {
  _.each(values, function (p) {
    logger.log(p[0] + ': ' + p[1]);
  });
}

function histogramCompleted(matches, values) {
  lineWriter.resetLine();

  _.each(values, function(p) {
    //console.log(p[0]+': '+p[1]);
    var barWidth = Math.round(p[1] / matches.max * 10);
    lineWriter.writeBar(barWidth, barWidth + 1);
    lineWriter.write(''+p[0]+': '+p[1]+'  ');
    lineWriter.nextLine();
  });
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
    return outputOptionsMap[option] || noCompleted;
  }
};


