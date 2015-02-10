#! /usr/bin/env node
"use strict";

var _ = require('underscore');
var pkginfo = require('pkginfo')(module);
var ansi = require('ansi');
var cursor = ansi(process.stdout);

var argv = require('yargs')
  .usage('Collating grep with visual feedback.')
  .example('$0 (\d+)\W+\d+$', 'Count apache http access log lines by response code')
  .version(pkginfo.version, 'version')
  .boolean('verbose')
  .alias('v', 'verbose')
  .argv;

var fs = require('fs');

var match = argv._[0];

var re = new RegExp(match);


var file = argv._[1];

var matchByKey = {};

var linebyline = require('linebyline');

cursor.horizontalAbsolute(0).eraseLine();

processFile(file, matchByKey, function(err, result) {
  cursor.reset();
  console.log('');
  //console.dir(result);

});

function updateRow(matches) {
  cursor.horizontalAbsolute(0);
  var sorted = _.chain(matches)
    .pairs()
    .sortBy(function(p) {return p[1]})
    .reverse()
    .value();
  var total = _.reduce(sorted, function(mem, p) {return mem+p[1];}, 0);
  _.each(sorted, function(p) {
      //console.log(p[0]+': '+p[1]);
      cursor.buffer();
      var barWidth = Math.round(p[1] / total * 10);
      if (barWidth > 0) {
        cursor.bg.black();
        _.times(barWidth, function (i) {
          cursor.write(' ');
        });
      } else {
        cursor.bg.grey();
        cursor.write(' ');
      }
      cursor.bg.reset();
      cursor.write(' ');
      cursor.write(p[0]).write(': ').write(''+p[1]).write('  ');
      cursor.flush();
    })
  ;
}

function processFile(file, matches, callback) {
  var ll = linebyline(file);
  ll.on('line', function (line, lineNumber) {
    var matchArray = line.match(re);
    if (matchArray && matchArray.length > 0) {
      if (argv.verbose) {
        console.log(lineNumber, 'Found: ', matchArray[1]);
      }
      matches[matchArray[1]] = (matches[matchArray[1]] || 0) + 1;
      updateRow(matches);
    }
  })
    .on('error', function (e) {
      console.log('Failed to process ' + file + ' due to: ' + e);
    })
    .on('close', function () {
      //console.log('closed');
      return callback(null, matches);
    });
}
