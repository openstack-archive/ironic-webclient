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

      'port': 9876,

      'basePath': './',

      'frameworks': ['jasmine'],

      'browsers': ['PhantomJS', 'Chrome', 'Firefox'],

      'plugins': [
        'karma-jasmine',
        'karma-phantomjs-launcher',
        'karma-chrome-launcher',
        'karma-firefox-launcher'
      ],

      'files': [
        // Library files, with some ordering,
        'www/js/lib/angular.js',
        'www/js/lib/*.js',

        // Application files
        'www/js/**/module.js',
        'www/js/**/*.js',

        // Tests
        'test/js/**/*.js'
      ],

      'exclude': [],

      'singleRun': true
    });
  };
})();
