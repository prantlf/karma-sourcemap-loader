import sharedConfig from './karma.shared.js'

export default function (config) {
  config.set(
    Object.assign({}, sharedConfig(config, 'test-sources'), {
      sourceMapLoader: {
        remapPrefixes: { '/test/': '../src/' }
      }
    })
  )
}
