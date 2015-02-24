"use strict";

/* Minimal example of files searching, with progress, and generating a report with the resulting matches */

var vcgrep = require('vcgrep');

var options = {
  progress: 'none',

};

vcgrep.searchFiles(/(\w+)+/g, ['README.md'], options, function(err, matches) {
  vcgrep.writeOutput('histogram', matches);
  console.log('Found '+matches.total+' hits across: '+matches.totalFiles+' files');
});