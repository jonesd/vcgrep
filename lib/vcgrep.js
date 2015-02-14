#!/usr/bin/env node
"use strict";

var _ = require('underscore');
var pkginfo = require('pkginfo')(module);
var ansi = require('ansi');
var cursor = ansi(process.stdout);

var lineWriter = require('./lineWriter');
var Matches = require('./matches');
var Searcher = require('./searcher');

var argv = require('yargs')
  .usage('Collating grep based on regexp capture with visual progress and result.\nUsage: $0 [options] [pattern] [input files]')
  .example('$0 \'(\\d+)\\W+\\d+$\' access.log', 'Count apache http access log lines by response code')
  .boolean('full')
  .alias('full', 'f')
  .describe('full', 'Generate full output without any styling')
  .boolean('global')
  .alias('global', 'g')
  .describe('global', 'Multiple matches per line are considered')
  .alias('head', 'h')
  .describe('head', 'Limit results to the most frequent n entries')
  .string('include')
  .describe('include', 'include only files that match the wildcard')
  .boolean('json')
  .describe('json', 'Output results in json format')
  .boolean('recursive')
  .alias('recursive', 'r')
  .describe('recursive', 'Navigate subdirectories for input files')
  .boolean('skip_results')
  .describe('skip_results', 'Do not show full results')
  .boolean('verbose')
  .alias('verbose', 'v')
  .describe('verbose', 'Verbose logging')
  .version(pkginfo.version, 'version')
  .check(function(argv, options) {
    if (argv['_'] &&  argv['_'].length > 1) {
      return true;
    } else if (argv['_'] &&  argv['_'].length == 1) {
      throw new Error('No input files')
    } else {
      throw new Error('Missing required pattern')
    }
  })
  .argv;

var fs = require('fs');
var shell = require('shelljs');
var matchstick = require('matchstick');

process.on('SIGINT', function () {
  console.log('Got a SIGINT. Aborting.');
  process.exit(0);
});

var pattern = argv._[0];

var re = new RegExp(pattern, argv.global ? 'g':'');


cursor.horizontalAbsolute(0).eraseLine();

progressFunc()(new Matches());

//TODO handle stdin

var searcher = new Searcher(re, new Matches());
searcher.searchAll(findFiles(), progressFunc(), function(error, matches) {
  cursor.reset();
  //console.dir(matches);

  completedFunc()(matches);
  //TODO grep exit status 0=one or more matches, 1=zero matches, >1 error
});

function findFiles() {
  var rootFiles = argv._.slice(1);
  return shell.find(rootFiles).filter(findFilesFilter);
}

function findFilesFilter(file) {
  return shell.test('-f', file) && (!argv.include || matchstick(argv.include, 'wildcard').match(file));
}

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

function progressFunc() {
  if (argv.full) {
    return noProgress;
  } else {
    return histogramLineProgress;
  }
}

function completedFunc() {
  if (argv.json) {
    return jsonCompleted;
  } else if (argv.full) {
    return textCompleted;
  } else if (!argv.skip_results) {
    cursor.horizontalAbsolute(0).eraseLine();
    return histogramCompleted;
  }
}

function jsonCompleted(matches) {
  var sorted = matches.values(argv.head);
   console.dir(sorted);
}

function textCompleted(matches) {
  var sorted = matches.values(argv.head);
    _.each(sorted, function (p) {
      console.log(p[0] + ': ' + p[1]);
    });
}

function histogramCompleted(matches) {
  cursor.horizontalAbsolute(0);
  var sorted = matches.values(argv.head);

  _.each(sorted, function(p) {
    //console.log(p[0]+': '+p[1]);
    var barWidth = Math.round(p[1] / matches.max * 10);
    writeBar(barWidth, barWidth + 1, cursor);
    cursor.write(p[0]).write(': ').write(''+p[1]).write('  ');
    console.log();
  });
}

function noProgress(matches) {
  // do nothing
}

function histogramLineProgress(matches) {
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
}
