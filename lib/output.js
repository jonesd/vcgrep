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
    lineWriter.writeBar(barWidth, 11);
    lineWriter.write(''+p[0]+': '+p[1]+'  ');
    lineWriter.nextLine();
  });
}

function countCompleted(matches, values) {
  logger.log('Found '+matches.total+' matches across: '+matches.totalFiles+' files');
};

var outputOptionsMap = {
  count: countCompleted,
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


