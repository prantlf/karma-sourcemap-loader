module.exports = function (_config, testName) {
  return {
    plugins: [
      'karma-jasmine', 'karma-brief-reporter', 'karma-chrome-launcher',
      require('..')
    ],

    frameworks: ['jasmine'],

    files: [
      { pattern: `${testName}.js`, nocache: true },
      { pattern: 'out/*.js' },
      // The type `html` is a workaround for JavaScript parsing errors;
      // the default type is `js` and there is no type for JSON files
      { pattern: 'out/*.map', type: 'html' }
    ],

    preprocessors: {
      'out/*.js': ['sourcemap'],
      'out/*.map': ['sourcemap']
    },

    reporters: ['brief'],

    browsers: ['ChromeDebugging'],

    customLaunchers: {
      ChromeDebugging: {
        base: 'ChromeHeadless',
        flags: [
          '--remote-debugging-port=9222', '--use-mock-keychain'
        ]
      }
    },

    briefReporter: { renderOnRunCompleteOnly: !!process.env.CI },

    // logLevel: _config.LOG_DEBUG,
    autoWatch: false,
    singleRun: true
  }
}
