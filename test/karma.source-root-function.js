const sharedConfig = require('./karma.shared')

module.exports = function (config) {
  config.set(Object.assign({}, sharedConfig(config, 'test-source-root'), {
    sourceMapLoader: {
      useSourceRoot(_file) {
        return '/sources'
      }
    }
  }))
}
