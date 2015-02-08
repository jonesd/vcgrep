#! /usr/bin/env node
"use strict";

var pkginfo = require('pkginfo')(module);

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

var ll = linebyline(file);
ll.on('line', function(line, lineNumber) {
  var matches = line.match(re);
  if (matches && matches.length > 0) {
    if (argv.verbose) {
      console.log(lineNumber, 'Found: ', matches[1]);
    }
    matchByKey[matches[1]] = (matchByKey[matches[1]] || 0) + 1;
  }
})
.on('error', function(e) {
    console.log('Failed to process '+file+' due to: '+e);
  })
  .on('close', function() {
    //console.log('closed');
    console.dir(matchByKey);
  });

