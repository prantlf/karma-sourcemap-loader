# @prantlf/karma-sourcemap-loader

[![Latest version](https://img.shields.io/npm/v/@prantlf/karma-sourcemap-loader)
 ![Dependency status](https://img.shields.io/librariesio/release/npm/@prantlf/karma-sourcemap-loader)
](https://www.npmjs.com/package/@prantlf/karma-sourcemap-loader)
[![Coverage](https://codecov.io/gh/prantlf/karma-sourcemap-loader/branch/master/graph/badge.svg)](https://codecov.io/gh/prantlf/karma-sourcemap-loader)

> [Karma] plugin that locates and loads source maps, optionally updating source paths.

This is a fork of the [original project] with the following improvements:

* Allow remapping or otherwise changing source paths in source maps
* Allow changing `sourceRoot` in source maps
* Allow adapting the source map files alone, if served separately by the Karma web server
* Allow failing the test run in case of invalid and missing source maps
* Fix handling of raw (URI-encoded) source maps - trim the leading `,` before parsing the content
* Introduce unit tests for the existing functionality

## Why

When you use karma not in isolation but as part of a build process (e.g. using grunt
or gulp) it is often the case that the compilation/transpilation is done on a previous
step of the process and not handled by karma preprocessors. In these cases source maps
don't get loaded by karma and you lose the advantages of having them. Collecting
the test code coverage using an instrumented code with source maps, for example.

Another reason may be the need for modifying relative source paths in source maps
to make sure that they point to source files in the project running the tests.

## How it works

This plug-in supports both inline and external source maps.

Inline source maps are located by searching "sourceMappingURL=" inside the javascript
file, both plain text and base64-encoded maps are supported.

External source maps are located by appending ".map" to the javascript file name.
So if for example you have `Hello.js`, the preprocessor will try to load source map from
`Hello.js.map`.

## Installation

This module can be installed in your project using [NPM], [PNPM] or [Yarn]. Make sure, that you use [Node.js] version 15.0 or newer.

    npm i -D @prantlf/karma-sourcemap-loader
    pnpm i -D @prantlf/karma-sourcemap-loader
    yarn add -D @prantlf/karma-sourcemap-loader

## Configuration

The code below shows a sample configuration of the preprocessor.

```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    plugins: ['@prantlf/karma-sourcemap-loader'],
    preprocessors: {
      '**/*.js': ['sourcemap'],
      '**/*.map': ['sourcemap']
    }
  });
};
```

The code below shows a configuration of the preprocessor with remapping of source file paths in source maps using path prefixes. The object `remapPrefixes` contains path prefixes as keys, which if they are detected in a source path, will be replaced by the key value. After the first detected prefix gets replaced, other prefixes will be ignored.

```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    plugins: ['@prantlf/karma-sourcemap-loader'],
    preprocessors: {
      '**/*.js': ['sourcemap'],
      '**/*.map': ['sourcemap']
    },
    sourceMapLoader: {
      remapPrefixes: {
        '/myproject/': '../src/',
        '/otherdep/': '../node_modules/otherdep/'
      }
    }
  });
};
```

The code below shows a configuration of the preprocessor with remapping of source file paths in source maps using a callback. The function `remapSource` receives an original source path and may return a changed source path. If it returns `undefined` or other false-y result, the source path will not be changed.

```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    plugins: ['@prantlf/karma-sourcemap-loader'],
    preprocessors: {
      '**/*.js': ['sourcemap'],
      '**/*.map': ['sourcemap']
    },
    sourceMapLoader: {
      remapSource(source) {
        if (source.startsWith('/myproject/')) {
          return '../src/' + source.substring(11);
        }
      }
    }
  });
};
```

The code below shows a sample configuration of the preprocessor with changing the `sourceRoot` property to a custom value, which will change the location where the debugger should locate the source files.

```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    plugins: ['@prantlf/karma-sourcemap-loader'],
    preprocessors: {
      '**/*.js': ['sourcemap'],
      '**/*.map': ['sourcemap']
    },
    sourceMapLoader: {
      useSourceRoot: '/sources'
    }
  });
};
```

The code below shows a sample configuration of the preprocessor with changing the `sourceRoot` property using a custom function to be able to compute the value depending on the path to the bundle. The `file` argument is the Karma file object `{ path, originalPath }` for the bundle.

```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    plugins: ['@prantlf/karma-sourcemap-loader'],
    preprocessors: {
      '**/*.js': ['sourcemap'],
      '**/*.map': ['sourcemap']
    },
    sourceMapLoader: {
      useSourceRoot(file) {
        return '/sources';
      }
    }
  });
};
```

The code below shows a sample configuration of the preprocessor with a strict error checking. A missing or an invalid source map will cause the test run fail.

```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    plugins: ['@prantlf/karma-sourcemap-loader'],
    preprocessors: {
      '**/*.js': ['sourcemap'],
      '**/*.map': ['sourcemap']
    },
    sourceMapLoader: {
      strict: true
    }
  });
};
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.

## License

Copyright (c) 2013-2020 Sergey Todyshev<br>
Copyright (c) 2023 Ferdinand Prantl

Licensed under the MIT license.

[original project]: https://github.com/demerzel3/karma-sourcemap-loader
[Node.js]: http://nodejs.org/
[NPM]: https://www.npmjs.com/
[PNPM]: https://pnpm.io/
[Yarn]: https://yarnpkg.com/
[Karma]: https://karma-runner.github.io/
