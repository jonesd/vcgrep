#!/usr/bin/env node
"use strict";

var _ = require('underscore');
var pkginfo = require('pkginfo')(module);
var ansi = require('ansi');
var cursor = ansi(process.stdout);

var lineWriter = require('./lineWriter');
var Matches = require('./matches');

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

var match = argv._[0];

var re = new RegExp(match, argv.global ? 'g':'');


var linebyline = require('linebyline');

cursor.horizontalAbsolute(0).eraseLine();

updateRow(new Matches());

//TODO handle stdin

var files = shell.find(argv._.slice(1)).filter(function(f) {return shell.test('-f', f) && (!argv.include || matchstick(argv.include, 'wildcard').match(f));});
//console.dir(files);

processFileIndex(0, new Matches(), function(error, result) {
  cursor.reset();
  //console.dir(result);
  if (argv.full) {
    dumpAllMatchesPlain(result);
  } else if (!argv.skip_results) {
    cursor.horizontalAbsolute(0).eraseLine();
    dumpAllMatches(result);
  }
  //TODO grep exit status 0=one or more matches, 1=zero matches, >1 error
});

function processFileIndex(index, matches, callback) {
  if (index < files.length) {
    var file = files[index];
    if (argv.verbose) {
      console.log('File: ' + file);
    }

    processFile(file, matches, function(err, result) {
      //TODO record errors?
      return processFileIndex(index+1, matches, callback);
    });
  } else {
    return callback(null, matches);
  }
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
  };
}

function dumpAllMatchesPlain(matches) {
  var sorted = matches.values(argv.head);
  _.each(sorted, function(p) {
    console.log(p[0]+': '+p[1]);
  });
}


function dumpAllMatches(matches) {
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

function updateRow(matches) {
  if (argv.full) {
    return;
  }
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

function processFile(file, matches, callback) {
  var lastTick = new Date().getTime();
  var ll = linebyline(file);
  ll.on('line', function (line, lineNumber) {
    var matchArray = line.match(re);
    if (matchArray && matchArray.length > 0) {
      for (var i = 1; i < matchArray.length; i++) {
        var key = matchArray[i];
        matches.increment(key);
        if (argv.verbose) {
          console.log(lineNumber, 'Found: ', key);
        }
      }
      var currentTick = new Date().getTime();
      if (currentTick - lastTick > 50) {
        updateRow(matches);
        lastTick = currentTick;
      }
    }
  })
    .on('error', function (e) {
      console.log('Failed to process ' + file + ' due to: ' + e);
    })
    .on('close', function () {
      //console.log('closed');
      updateRow(matches);
      return callback(null, matches);
    });
}
