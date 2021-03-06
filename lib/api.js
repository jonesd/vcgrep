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

module.exports.searchFiles = function searchFiles(re, files, options, callback) {
    var searcher = new Searcher(re, new Matches(), options.ignoreCase);
    var progress = lookupProgress(options.progress, searcher);
    searcher.searchAll(files, callback);
};

module.exports.writeOutput = function writeOutput(reportOptionOrHandler, matches, values) {
  var outputWriter = lookupOutput(reportOptionOrHandler);
  outputWriter(matches, values || matches.values());
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

function lookupProgress(optionOrHandler, emitter) {
  var progress = optionOrHandler;
  if (_.isString(optionOrHandler)) {
    progress = Progress.fromOption(optionOrHandler, emitter);
  }
  if (! progress) {
    progress = Progress.fromOption(Progress.noneOption, emitter);
  }
  return progress;
}

