/*
 * Copyright (c) 2015 Hewlett-Packard Development Company, L.P.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

/**
 * This resource attempts to automatically detect your cloud's configuration
 * by searching for it in common locations. First we check config.json, living
 * on the server adjacent to index.html. Secondly, we construct a default
 * configuration object that assumes that all services are running on
 * the current domain. Note that the format is an array: it is feasible to
 * configure multiple access points within config.json.
 *
 * [{
 *     "name": "My Little Cloud",
 *     "ironic": {
 *          "api": "https://ironic.example.com:6385/"
 *     },
 *     "glance": {
 *          "api": "https://glance.example.com:9292/"
 *     }
 * }]
 */
angular.module('openstack').factory('Configuration',
    function ($q, $http, $log, $location) {
        'use strict';

        /**
         * The configuration that has been detected and cached.
         */
        var configuration;

        /**
         * The singleton configuration promise.
         */
        var deferred;

        /**
         * Attempt to load an included configuration file.
         */
        function loadConfigurationFile() {
            $log.info('Attempting to load parameters from ./config.json');
            var deferred = $q.defer();
            $http.get('./config.json').then(
                function (response) {
                    deferred.resolve(response);
                },
                function () {
                    $log.warn('Cannot load ./config.json, using defaults.');
                    deferred.resolve([]);
                }
            );
            return deferred.promise;
        }

        /**
         * Build default configuration for services on the local server.
         */
        function defaultConfiguration() {
            $log.info('Configuring local API endpoint.');
            var deferred = $q.defer();
            var ironicApi =
                $location.protocol() + '://' + $location.host() + ':6385/';
            deferred.resolve([
                {
                    'name': 'Default',
                    'ironic': {
                        'api': ironicApi
                    }
                }
            ]);
            return deferred.promise;
        }

        /**
         * Resolve any configuration parameters.
         */
        return {
            /**
             * Asynchronously resolve the Cloud Configuration.
             *
             * @returns {*}
             */
            resolve: function () {
                if (!deferred) {
                    deferred = $q.defer();

                    // Have we already cached this?
                    if (configuration != null) {
                        deferred.resolve(configuration);
                    } else {
                        // Resolve the configuration.
                        $q.all({
                            'config': loadConfigurationFile(),
                            'default': defaultConfiguration()
                        }).then(function (results) {
                            var config = [];
                            if (results['config'].length > 0) {
                                config = results['config'];
                            } else {
                                config = results['default'];
                            }
                            configuration = config;
                            deferred.resolve(configuration);
                        }, function () {
                            configuration = [];
                            deferred.resolve(configuration);
                        });
                    }
                }

                return deferred.promise;
            },

            /**
             * Return the current configuration.
             *
             * @returns {*}
             */
            get: function () {
                return configuration;
            }
        }
    })
;
