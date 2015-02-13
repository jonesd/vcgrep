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

Pattern:

The `pattern` is a regular expression containing at least one capture group.

For more details on the JavaScript regular expression syntax, see: [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions?redirectlocale=en-US&redirectslug=JavaScript%2FGuide%2FRegular_Expressions)

Options:

    --full, -f       Generate full output without any styling
    --global, -g     Multiple matches per line are considered
    --head, -h       Limit results to the most frequent n entries
    --include        include only files that match the wildcard
    --recursive, -r  Navigate subdirectories for input files
    --skip_results   Do not show full results
    --verbose, -v    Verbose logging
    --version        Show version number

## Licence

vcgrep is released under the [MIT licence](https://github.com/jonesd/vcgrep/blob/master/LICENSE).


## Author

David Jones

[http://www.dgjones.info](http://www.dgjones.info)

[https://github.com/jonesd/vcgrep](https://github.com/jonesd/vcgrep)
