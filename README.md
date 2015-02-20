# vcgrep

**vcgrep** prints a summary of all the matches of a regular-expression capture group within input files. Simple
terminal visualization of the progress and results is provided. Use it to easily show the frequency of status codes
from apache access logs, or the frequency of words in a text document.

<img src="http://dgjones.info/vcgrep/text-search-card.gif"/>

[![Build Status](https://travis-ci.org/jonesd/vcgrep.svg?branch=master)](https://travis-ci.org/jonesd/vcgrep)

## Install

vcgrep requires node 0.10 or later.

    npm install -g vcgrep


## Examples

Frequency of status codes in an apache access log:

    vcgrep '(\d+)\W+\d+$' test/sample-access.log


Frequency of words found in a text document:

    vcgrep -g '(\w+)+' README.md


Frequency of words found in js documents using the full page card progress mode:

    vcgrep  -p card -o none -g  -i --include '*.js' '(\w+)+' lib


## Syntax

    Usage: vcgrep [OPTIONS] PATTERN FILES...

### Pattern

The `pattern` is a regular expression containing at least one capture group.

For more details on the JavaScript regular expression syntax, see: [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions?redirectlocale=en-US&redirectslug=JavaScript%2FGuide%2FRegular_Expressions)

### General Options

    --help           Prints a summary of the usage
    --verbose, -v    Verbose logging
    --version        Show version number

## File Selection Options

    --include        include only files that match the wildcard

## Pattern Matching Options

    --global, -g     Multiple matches per line are considered
    --ignore, -i     Ignore case for determining capture key

## Output Options

    --head, -h       Limit results to the most frequent n entries
    --output, -o     Output format, one of: none,plain,json,histogram  [default: "histogram"]
    --progress, -p   Progress feedback, one of: card,none,line         [default: "line"]


## API

The searching, progress, and report output features are available to NodeJS modules through an API module.

For examples of how to use the API see: [lib/api.js](https://github.com/jonesd/vcgrep/blob/master/lib/api.js)

```js
var vcgrep = require('vcgrep');

vcgrep.searchFiles(/(\w+)+/g, ['README.md'], false, 'none', function(err, matches) {
  vcgrep.writeOutput('histogram', matches);
  console.log('Found '+matches.total+' hits across: '+matches.totalFiles+' files');
});
```


# Change Log

## [Unreleased][unreleased]
### Changed
- Progress API now event based

## [0.2.1] - 2015-02-17
### Added
- 'card' full page progress
- --ignore case of capture key

## [0.2.0] - 2015-02-16
### Added
- Introduce simple API entry point for direct use by NodeJS modules
- Process exit code, 0 when matches found, 1 no matches

## [0.1.0] - 2015-02-14
### Added
- Initial feature set


## Licence

vcgrep is released under the [MIT licence](https://github.com/jonesd/vcgrep/blob/master/LICENSE).


## Author

David Jones

[http://www.dgjones.info](http://www.dgjones.info)

[https://github.com/jonesd/vcgrep](https://github.com/jonesd/vcgrep)
