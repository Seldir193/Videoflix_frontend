module.exports = function (config) {
   config.set({
     basePath: '',
     frameworks: ['jasmine', '@angular-devkit/build-angular'],
    // ▸ Browser/Launcher-Block
    browsers: ['ChromeHeadlessCI'],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',           // wichtig im GitHub-Runner
          '--disable-gpu',
          '--disable-dev-shm-usage'
        ],
},
    },
     plugins: [
       require('karma-jasmine'),
       require('karma-chrome-launcher'),
       require('karma-jasmine-html-reporter'),
       require('karma-coverage'),
       require('@angular-devkit/build-angular/plugins/karma')
     ],
     client: { jasmine: {} },
     jasmineHtmlReporter: { suppressAll: true },
     coverageReporter: {
       dir: require('path').join(__dirname, './coverage/videoflix-ui'),
       subdir: '.',
       reporters: [{ type: 'html' }, { type: 'text-summary' }],
     },
     reporters: ['progress', 'kjhtml'],
    browsers: ['Chrome'],
    reporters: ['progress', 'kjhtml'],
     restartOnFileChange: true,
   });
 };
