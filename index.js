const { access, readFile } = require('fs')
const { dirname, resolve } = require('path')

const sourcemapUrlRegeExp = /^\/\/#\s*sourceMappingURL=/
const charsetRegex = /^;charset=([^;]+);/

const createSourceMapPreprocessor = (_args, logger, config) => {
  /* c8 ignore next */
  const options = config && config.sourceMapLoader || {}
  const { remapPrefixes, remapSource, useSourceRoot, onlyWithURL, strict } = options
  const needsUpdate = remapPrefixes || remapSource || useSourceRoot

  const log = logger.create('preprocessor.sourcemap')

  return (content, file, done) => {
    const { path, originalPath } = file

    // Updates source paths according to the configuration
    function remapSources(sources) {
      const all = sources.length
      let remapped = 0
      const remappedPrefixes = {}
      let i, source, remappedSource

      // Replaces source path prefixes using a key:value map
      function handlePrefixes() {
        for (const sourcePrefix in remapPrefixes) {
          const targetPrefix = remapPrefixes[sourcePrefix]
          if (source.startsWith(sourcePrefix)) {
            const target = targetPrefix + source.substring(sourcePrefix.length)
            sources[i] = target
            ++remapped
            // Log only one remapping as an example for each prefix to prevent
            // flood of messages on the console
            if (!remappedPrefixes[sourcePrefix]) {
              remappedPrefixes[sourcePrefix] = true
              log.debug(' ', source, '>>', target)
            }
            return true
          }
        }
      /* c8 ignore next */
      }

      // Replaces source paths using a custom function
      function handleMapper() {
        const target = remapSource(source)
        // Remapping is considered happenned only if the handler returns
        // a non-empty path different from the existing one
        if (target && target !== source) {
          sources[i] = target
          ++remapped
          // Log only one remapping as an example to prevent flooding the console
          if (!remappedSource) {
            remappedSource = true
            log.debug(' ', source, '>>', target)
          }
          return true
        }
      }

      for (i = 0; i < all; ++i) {
        // Normalise Windows paths to use only slashes as a separator
        source = sources[i].replaceAll('\\', '/')
        if (remapPrefixes) {
          // One remapping is enough if a prefix was replaced, do not let
          // the handler below check the source path any more
          if (handlePrefixes()) continue
        }
        if (remapSource) {
          handleMapper()
        }
      }

      if (remapped) {
        log.debug('  ...')
        log.debug(' ', remapped, 'sources from', all, 'were remapped')
      }
    }

    // Parses a string with source map as JSON and handles errors
    function parseMap(data) {
      try {
        return JSON.parse(data)
      } catch (err) {
        /* c8 ignore next 5 */
        if (strict) {
          done(new Error(`malformed source map for ${originalPath}\nError: ${err.message}`))
          // Returning `false` will make the caller abort immediately
          return false
        }
        log.warn('malformed source map for', originalPath)
        log.warn('Error:', err.message)
      }
    }

    // Sets the sourceRoot property to a fixed or computed value
    function setSourceRoot(sourceMap) {
      sourceMap.sourceRoot = typeof useSourceRoot === 'function' ?
        useSourceRoot(file) : useSourceRoot
    }

    // Performs configured updates of the source map content
    function updateSourceMap(sourceMap) {
      if (remapPrefixes || remapSource) {
        remapSources(sourceMap.sources)
      }
      if (useSourceRoot) {
        setSourceRoot(sourceMap)
      }
    }

    // Updates the source map content according to the configuration
    function sourceMapData(data) {
      const sourceMap = parseMap(data)
      if (sourceMap) {
        // Perform the remapping only if there is a configuration for it
        if (needsUpdate) {
          updateSourceMap(sourceMap)
        }
        file.sourceMap = sourceMap
      /* c8 ignore next 3 */
      } else if (sourceMap === false) {
        return
      }
      done(content)
    }

    // Processes the inline source map
    function inlineMap(inlineData) {
      let charset = 'utf-8'
      if (charsetRegex.test(inlineData)) {
        const matches = inlineData.match(charsetRegex)
        if (matches) {
          charset = matches[1]
          inlineData = inlineData.slice(matches[0].length -1)
        }
      }

      if (/^;base64,/.test(inlineData)) {
        // base64-encoded JSON string
        log.debug('base64-encoded source map for', originalPath)
        const buffer = Buffer.from(inlineData.slice(8), 'base64') // slice ;base64,
        sourceMapData(buffer.toString(charset))
      } else if (inlineData.startsWith(',')) {
        // straight-up URL-encoded JSON string
        log.debug('raw inline source map for', originalPath)
        sourceMapData(decodeURIComponent(inlineData.slice(1))) // slice ,
      } else {
        /* c8 ignore next 2 */
        if (strict) {
          done(new Error(`invalid source map in ${originalPath}`))
        } else {
          log.warn('invalid source map in', originalPath)
          done(content)
        }
      }
    }

    // Processes the external source map
    function fileMap(mapPath, optional) {
      access(mapPath, err => {
        if (err) {
          if (!optional) {
            /* c8 ignore next 3 */
            if (strict) {
              done(new Error(`missing external source map for ${originalPath}`))
              return
            } else {
              log.warn('missing external source map for', originalPath)
            }
          }
          done(content)
          return
        }

        readFile(mapPath, (err, data) => {
          /* c8 ignore next 10 */
          if (err) {
            if (strict) {
              done(new Error(`reading external source map failed for ${originalPath}\n${err}`))
            } else {
              log.warn('reading external source map failed for', originalPath)
              log.warn(err)
              done(content)
            }
            return
          }

          log.debug('external source map exists for', originalPath)
          sourceMapData(data)
        })
      })
    }

    // Remap source paths in a directly served source map
    function convertMap() {
      // Perform the remapping only if there is a configuration for it
      if (needsUpdate) {
        log.debug('processing source map', originalPath)
        const sourceMap = parseMap(content)
        if (sourceMap) {
          updateSourceMap(sourceMap)
          content = JSON.stringify(sourceMap)
        /* c8 ignore next 3 */
        } else if (sourceMap === false) {
          return
        }
      }
      done(content)
    }

    // If the preprocessed file is not JavaScript, handle it as an external
    // source map and have Karma serve the updated content
    if (path.endsWith('.map')) return convertMap()

    const lines = content.split(/\n/)
    let lastLine
    do {
      lastLine = lines.pop()
    } while (/^\s*$/.test(lastLine))

    let mapUrl
    if (sourcemapUrlRegeExp.test(lastLine)) {
      mapUrl = lastLine.replace(sourcemapUrlRegeExp, '')
    }

    if (!mapUrl) {
      if (onlyWithURL !== false) {
        done(content)
      } else {
        fileMap(`${path}.map`, true)
      }
    } else if (/^data:application\/json/.test(mapUrl)) {
      inlineMap(mapUrl.slice(21)) // slice data:application/json
    } else {
      fileMap(resolve(dirname(path), mapUrl), false)
    }
  }
}

createSourceMapPreprocessor.$inject = ['args', 'logger', 'config']

module.exports = {
  'preprocessor:sourcemap': ['factory', createSourceMapPreprocessor]
}
