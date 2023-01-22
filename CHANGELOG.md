# 1.0.0 (2023-01-22)

Initial release of [this fork] of the [original project] with the following improvements:

## Features

* Allow remapping or otherwise changing source paths in source maps
* Allow changing `sourceRoot` in source maps
* Allow adapting the source map files alone, if served separately by the Karma web server
* Add option `strict` for a strict error handling of invalid and missing source maps

## Fixes

* Fix handling of raw (URI-encoded) source maps - trim the leading `,` before parsing the content
* Warn about a missing external source map, is the source mapping URL is invalid
* Handle malformed source map content as a warning or failure

## Chores

* Introduce unit tests for the existing functionality

**BREAKING CHANGE**: Use `@prantlf/karma-sourcemap-loader` instead of `karma-sourcemap-loader` as the package name to depend on. Other changes should not affect typical projects:
* The minimum supported version of Node.js is 15. The current LTS version is already 16.
* The package `graceful-fs` is not used any more. Recent versions of Node.js should be reliable enough on Windows.
* Source maps are loaded only for files with `sourceMappingURL` by default. (The default value of the option `onlyWithURL` has changed to `true`.) If your JavaScript files lack `sourceMappingURL`, but include external source maps, set the options `onlyWithURL` to `false`.

[this fork]: http://github.com/prantlf/karma-sourcemap-loader
[original project]: https://github.com/demerzel3/karma-sourcemap-loader
