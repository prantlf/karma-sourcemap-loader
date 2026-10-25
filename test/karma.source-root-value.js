import sharedConfig from './karma.shared.js'

export default function (config) {
  config.set(
    Object.assign({}, sharedConfig(config, 'test-source-root'), {
      sourceMapLoader: {
        useSourceRoot: '/sources',
        onlyWithURL: false // Just to complete the code coverage
      }
    })
  )
}
