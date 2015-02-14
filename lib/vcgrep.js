#!/usr/bin/env node
"use strict";

var _ = require('underscore');
var pkginfo = require('pkginfo')(module);
var shell = require('shelljs');
var matchstick = require('matchstick');

var Matches = require('./matches');
var Searcher = require('./searcher');
var Progress = require('./progress');
var Output = require('./output');

var argv = require('yargs')
  .usage('Collating grep based on regexp capture with visual progress and result.\nUsage: $0 [options] [pattern] [input files]')
  .example('$0 \'(\\d+)\\W+\\d+$\' access.log', 'Count apache http access log lines by response code')
  .example('$0 -g \'(\\w+)+\' README.md', 'Count words in README.md')
  .boolean('global')
  .alias('global', 'g')
  .describe('global', 'Multiple matches per line are considered')
  .alias('head', 'h')
  .describe('head', 'Limit results to the most frequent n entries')
  .string('include')
  .describe('include', 'include only files that match the wildcard')
  .string('output')
  .alias('output', 'o')
  .default('output', Output.defaultOption)
  .describe('output', 'Output format, one of: '+ Output.options)
  .string('progress')
  .alias('progress', 'p')
  .default('progress', Progress.defaultOption)
  .describe('progress', 'Progress feedback, one of: '+ Progress.options)
  .boolean('recursive')
  .alias('recursive', 'r')
  .describe('recursive', 'Navigate subdirectories for input files')
  .boolean('verbose')
  .alias('verbose', 'v')
  .describe('verbose', 'Verbose logging')
  .version(pkginfo.version, 'version')
  .strict()
  .demand(2)
  .check(function(argv, options) {
    if (!_.contains(Output.options, argv['output'])) {
      throw new Error('Unknown --output value: "'+argv['output']+ '". Should be one of: '+Output.options);
    }
    if (!_.contains(Progress.options, argv['progress'])) {
      throw new Error('Unknown --progress value: "'+argv['progress']+ '". Should be one of: '+Progress.options);
    }
  })
  .argv;

process.on('SIGINT', function () {
  console.log('Got a SIGINT. Aborting.');
  process.exit(0);
});

var pattern = argv._[0];

var re = new RegExp(pattern, argv.global ? 'g':'');


//TODO handle stdin

var searcher = new Searcher(re, new Matches());
searcher.searchAll(findFiles(), createProgressHandler(), function(error, matches) {
  //console.dir(matches);

  writeOutput(matches);
  //TODO grep exit status 0=one or more matches, 1=zero matches, >1 error
});

function findFiles() {
  var rootFiles = argv._.slice(1);
  return shell.find(rootFiles).filter(findFilesFilter);
}

function findFilesFilter(file) {
  return shell.test('-f', file) && (!argv.include || matchstick(argv.include, 'wildcard').match(file));
}

function createProgressHandler() {
  return Progress.fromOption(argv['progress']);
}

function writeOutput(matches) {
  var values = matches.values(argv.head);
  Output.fromOption(argv['output'])(matches, values);
}

