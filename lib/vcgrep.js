#! /usr/bin/env node
"use strict";

var _ = require('underscore');
var pkginfo = require('pkginfo')(module);
var ansi = require('ansi');
var cursor = ansi(process.stdout);

var lineWriter = require('./lineWriter');

var argv = require('yargs')
  .usage('Collating grep based on regexp capture with visual progress and result.\nUsage: $0 [flags] [pattern] [input files]')
  .example('$0 (\\d+)\\W+\\d+$', 'Count apache http access log lines by response code')
  .version(pkginfo.version, 'version')
  .boolean('verbose')
  .alias('v', 'verbose')
  .boolean('skip_result')
  .check(function(argv, options) {
    if (argv['_'] &&  argv['_'].length > 0) {
      return true;
    } else {
      throw new Error('Missing required pattern')
    }
  })
  .argv;

var fs = require('fs');

var match = argv._[0];

var re = new RegExp(match);


var linebyline = require('linebyline');

cursor.horizontalAbsolute(0).eraseLine();

updateRow({});

//TODO handle stdin

processFileIndex(1, {}, function(error, result) {
  cursor.reset();
  //console.dir(result);
  if (!argv.skip_result) {
    cursor.horizontalAbsolute(0).eraseLine();
    dumpAllMatches(result);
  }
  //TODO grep exit status 0=one or more matches, 1=zero matches, >1 error
});

function processFileIndex(index, matchByKey, callback) {
  if (index < argv._.length) {
    var file = argv._[index];
    if (argv.verbose) {
      console.log('File: ' + file);
    }
    processFile(file, matchByKey, function(err, result) {
      //TODO record errors?
      return processFileIndex(index+1, matchByKey, callback);
    });
  } else {
    return callback(null, matchByKey);
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
  _.times(total - barWidth, function (i) {
    writer.write(' ');
  })
}

function dumpAllMatches(matches) {
  cursor.horizontalAbsolute(0);
  var sorted = _.chain(matches)
    .pairs()
    .sortBy(function(p) {return p[1]})
    .reverse()
    .value();
  var total = _.reduce(sorted, function(mem, p) {return mem+p[1];}, 0);
  _.each(sorted, function(p) {
    //console.log(p[0]+': '+p[1]);
    var barWidth = Math.round(p[1] / total * 20);
    writeBar(barWidth, barWidth + 1, cursor);
    cursor.write(p[0]).write(': ').write(''+p[1]).write('  ');
    console.log();
  });
}

function updateRow(matches) {
  lineWriter.resetLine();
  var sorted = _.chain(matches)
    .pairs()
    .sortBy(function(p) {return p[1]})
    .reverse()
    .value();
  var total = _.reduce(sorted, function(mem, p) {return mem+p[1];}, 0);
  cursor.buffer();
  _.each(sorted, function(p) {
      //console.log(p[0]+': '+p[1]);

      var barWidth = Math.round(p[1] / total * 10);
      writeBar(barWidth, barWidth + 1, lineWriter);

    lineWriter.write(p[0]);
    lineWriter.write(': ');
    lineWriter.write(''+p[1]);
    lineWriter.write('  ');

    });
  cursor.flush();
}

function processFile(file, matches, callback) {
  var lastTick = new Date().getTime();
  var ll = linebyline(file);
  ll.on('line', function (line, lineNumber) {
    var matchArray = line.match(re);
    if (matchArray && matchArray.length > 0) {
      if (argv.verbose) {
        console.log(lineNumber, 'Found: ', matchArray[1]);
      }
      matches[matchArray[1]] = (matches[matchArray[1]] || 0) + 1;
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
