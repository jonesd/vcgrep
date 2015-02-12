# vcgrep

File content search tool based on regular expression capture groups with simple terminal visualization. Use it to
easily show the frequency of status codes from apache access logs, or the frequency of words in a text document.


## Install

vcgrep requires node 0.10 or later.

    npm install vcgrep -g


## Examples

Frequency of status codes in an apache access log:

    vcgrep '(\d+)\W+\d+$' test/sample-access.log


Frequency of words found in a text document:

    vcgrep -g '(\w+)+' README.md


## Usage

    Usage: vcgrep [options] [pattern] [input files]

The `pattern` is a regular expression containing at least one capture group.

For more details on the JavaScript regular expression syntax, see: [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions?redirectlocale=en-US&redirectslug=JavaScript%2FGuide%2FRegular_Expressions)

Options:

    --version       Show version number
    --verbose, -v   Verbose logging
    --full, -f      Generate full output without any styling
    --global, -g    Multiple matches per line are considered
    --skip_results  Do not show full results
    --top, -t       Results will include only the first top entries

## Licence

vcgrep is released under the [MIT licence](https://github.com/jonesd/vcgrep/blob/master/LICENSE).


## Author

David Jones
http://www.dgjones.info

https://github.com/jonesd/vcgrep
