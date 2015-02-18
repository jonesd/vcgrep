"use strict";

/* JS API access to the core file searching and collating, and the visual progress and output report generator.
  Example usage can be found in the CLI vcgrep.js file.
 */

var _ = require('underscore');
var pkginfo = require('pkginfo')(module);

var Matches = require('./matches');
var Searcher = require('./searcher');
var Progress = require('./progress');
var Output = require('./output');

module.exports.version = pkginfo.version;

module.exports.Progress = Progress;
module.exports.Output = Output;

module.exports.searchFiles = function searchFiles(re, files, ignoreCase, progressOptionOrHandler, callback) {
    var searcher = new Searcher(re, new Matches(), ignoreCase);
    searcher.searchAll(files, lookupProgress(progressOptionOrHandler), callback);
};

module.exports.writeOutput = function writeOutput(reportOptionOrHandler, matches, values) {
  lookupOutput(reportOptionOrHandler)(matches, values || matches.values());
};

function lookupOutput(optionOrHandler) {
  var output = optionOrHandler;
  if (_.isString(optionOrHandler)) {
    output = Output.fromOption(optionOrHandler);
  }
  if (!output) {
    output = Output.fromOption(Output.defaultOption);
  }
  return output;
}

function lookupProgress(optionOrHandler) {
  var progress = optionOrHandler;
  if (_.isString(optionOrHandler)) {
    progress = Progress.fromOption(optionOrHandler);
  }
  if (! progress) {
    progress = Progress.fromOption(Progress.noneOption);
  }
  return progress;
}

