/*
 * Copyright (c) 2015 Hewlett-Packard Development Company, L.P.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 * 	http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */
(function () {
  'use strict';

  module.exports = function (config) {

    config.set({

      port: 9876,

      basePath: './',

      frameworks: ['jasmine'],

      browsers: ['Chrome', 'Firefox'],

      reporters: ['progress', 'coverage', 'threshold'],

      browserNoActivityTimeout: 30000,

      plugins: [
        'karma-jasmine',
        'karma-coverage',
        'karma-threshold-reporter',
        'karma-chrome-launcher',
        'karma-firefox-launcher'
      ],

      preprocessors: {
        'www/js/{!lib/**/*.js,*.js}': ['coverage']
      },

      files: [
        // Library files, with some ordering.
        'www/js/lib/angular.js',
        'node_modules/angular-mocks/angular-mocks.js',
        'www/js/lib/*.js',

        // Application files
        'www/js/**/*.js',

        // Mocks
        'test/mock/**/*.js',

        // Tests
        'test/spec/**/*.js'
      ],

      coverageReporter: {
        type: 'html',
        dir: 'cover',
        instrumenterOptions: {
          istanbul: {noCompact: true}
        }
      },

      // Coverage threshold values.
      thresholdReporter: {
        statements: 94, // target 100
        branches: 97, // target 100
        functions: 92, // target 100
        lines: 94 // target 100
      },

      exclude: [],

      singleRun: true
    });
  };
})();
