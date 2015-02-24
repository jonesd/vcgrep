#!/usr/bin/env node
"use strict";

/* CLI access to vcgrep functionality */

var _ = require('underscore');
var shell = require('shelljs');
var matchstick = require('matchstick');

var api = require('./api');

var argv = processArguments();

registerSignalHandlers();

searchFiles(function afterSearchFiles(error, matches) {
  writeOutput(matches);
  exit(matches);
});


function searchFiles(callback) {
  var re = buildRegularExpression();
  var files = findFiles();
  var progress = argv['progress'];
  api.searchFiles(re, files, argv['ignore-case'], progress, callback);
}

function findFiles() {
  var rootFiles = argv._.slice(1);
  return shell.find(rootFiles).filter(findFilesFilter);
}

function findFilesFilter(file) {
  return shell.test('-f', file) && (!argv.include || matchstick(argv.include, 'wildcard').match(file));
}

function writeOutput(matches) {
  var values = matches.values(argv.head);
  api.writeOutput(argv['output'], matches, values);
}

function processArguments() {
  return require('yargs')
    .usage('Collating grep based on regexp capture with visual progress and result.\nUsage: $0 [OPTIONS] PATTERN FILES...')
    .example('$0 \'(\\d+)\\W+\\d+$\' access.log', 'Count apache http access log lines by response code')
    .example('$0 -g \'(\\w+)+\' README.md', 'Count words in README.md')
    .boolean('global')
    .alias('global', 'g')
    .describe('global', 'Multiple matches per line are considered')
    .alias('head', 'h')
    .describe('head', 'Limit results to the most frequent n entries')
    .boolean('ignore-case')
    .alias('ignore-case', 'i')
    .describe('ignore-case', 'Ignore case for determining capture key')
    .string('include')
    .describe('include', 'include only files that match the wildcard')
    .string('output')
    .alias('output', 'o')
    .default('output', api.Output.defaultOption)
    .describe('output', 'Output format, one of: ' + api.Output.options)
    .string('progress')
    .alias('progress', 'p')
    .default('progress', api.Progress.defaultOption)
    .describe('progress', 'Progress feedback, one of: ' + api.Progress.options)
    .boolean('verbose')
    .alias('verbose', 'v')
    .describe('verbose', 'Verbose logging')
    .version(api.version, 'version')
    .strict()
    .demand(2)
    .check(function (argv, options) {
      if (!_.contains(api.Output.options, argv['output'])) {
        throw new Error('Unknown --output value: "' + argv['output'] + '". Should be one of: ' + api.Output.options);
      }
      if (!_.contains(api.Progress.options, argv['progress'])) {
        throw new Error('Unknown --progress value: "' + argv['progress'] + '". Should be one of: ' + api.Progress.options);
      }
    })
    .argv;
}

function buildRegularExpression() {
  var pattern = argv._[0];
  return new RegExp(pattern, argv.global ? 'g' : '');
}

function exit(matches) {
// Follow grep exit status: 0=one or more matches, 1=zero matches, >1 error
  var anyMatches = matches.total > 0;
  process.exit(anyMatches ? 0 : 1);
}

function registerSignalHandlers() {
  process.on('SIGINT', function () {
    console.log('Got a SIGINT. Aborting.');
    process.exit(0);
  });
}

