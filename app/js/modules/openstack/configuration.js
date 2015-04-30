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
 * Configuration values used inside of the configuration component.
 */
angular.module('openstack').config(function ($$errorCode) {
    'use strict';

    /**
     * Add the 'no configuration' error code to our error constants.
     */
    $$errorCode.NO_CONFIGURATION = 'no_configuration';

    /**
     * Add the 'has configuration' error code to our error constants.
     */
    $$errorCode.HAS_CONFIGURATION = 'has_configuration';
});


/**
 * A default configuration structure. This may be overridden by applications by
 * injecting their own 'defaultConfiguration' constant into the application
 * after this file is loaded.
 */
angular.module('openstack').factory('$$defaultConfiguration', function () {
    'use strict';

    return {
        name: '',
        ironic: {
            api: ''
        }
    };
});

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
angular.module('openstack').service('$$configuration',
    function ($q, $http, $log, $location, $$persistentStorage, $$errorCode) {
        'use strict';

        /**
         * The key we use in our persistent storage to keep track of the
         * selected id.
         */
        var storageId = 'selected-cloud';

        /**
         * The singleton configuration promise for all configurations.
         */
        var deferAll;

        /**
         * The singleton configuration promise for the selected configuration.
         */
        var deferSelected;

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
            var defaultDefer = $q.defer();
            var ironicApi =
                $location.protocol() + '://' + $location.host() + ':6385/';

            $http.get(ironicApi).then(function (response) {
                var name = response.data.name || 'Local';
                var defaultVersion = response.data.default_version.links[0];
                var localConfig = [
                    {
                        'id': 'localhost',
                        'name': name,
                        'ironic': {
                            'api': defaultVersion.href,
                            'version': response.data.default_version.id
                        }
                    }
                ];
                defaultDefer.resolve(localConfig);
            }, function () {
                defaultDefer.resolve([]);
            });
            return defaultDefer.promise;
        }

        /**
         * Resolve all the configurations.
         */
        function resolveAllConfigurations() {
            if (!deferAll) {
                deferAll = $q.defer();

                // Resolve the configuration.
                $q.all({
                    'config': loadConfigurationFile(),
                    'default': defaultConfiguration()
                }).then(function (results) {
                    var fileConfigs = results.config;
                    var defaultConfigs = results.default;

                    var config = [];
                    for (var i = 0; i < fileConfigs.length; i++) {
                        var c = fileConfigs[i];
                        if (c.hasOwnProperty('id')) {
                            config.push(c);
                        } else {
                            $log.warn('Config block missing "id" ' +
                            'field, ignoring.', c);
                        }
                    }
                    if (config.length === 0) {
                        config = defaultConfigs;
                    }

                    deferAll.resolve(config);
                }, function () {
                    deferAll.resolve([]);
                });
            }

            return deferAll.promise;
        }

        /**
         * Resolve the current selected configuration.
         */
        function resolveSelectedConfiguration() {
            if (!deferSelected) {
                deferSelected = $q.defer();

                var selectedId = $$persistentStorage.get(storageId);

                resolveAllConfigurations().then(
                    function (configs) {
                        if (configs.length === 0) {
                            deferSelected.reject($$errorCode.NO_CONFIGURATION);
                            return;
                        }

                        // Pick the configuration from the loaded configs. Note
                        // that if the selectedId is null, this will never
                        // match.
                        var selectedConfig = configs[0];
                        configs.forEach(function (config) {
                            if (config.id === selectedId) {
                                $log.debug('Selecting config: ' + selectedId);
                                selectedConfig = config;
                            }
                        });

                        // If the selected config does not match the selected
                        // id, then it's likely that the config disappeared.
                        // Reset the selectedId to match the chosen one.
                        if (selectedId !== selectedConfig.id) {
                            selectedId = selectedConfig.id;
                            $$persistentStorage.set(storageId, selectedId);
                            $log.debug('AutoSelecting cloud: ' + selectedId);
                        }
                        deferSelected.resolve(selectedConfig);
                    }
                );
            }

            return deferSelected.promise;
        }


        /**
         * Resolve any configuration parameters.
         */
        return {
            /**
             * Asynchronously resolve the Cloud Configuration. This will always
             * resolve, however it is likely that the resulting configuration
             * array is empty.
             *
             * @returns {promise}
             */
            resolveAll: function () {
                return resolveAllConfigurations();
            },

            /**
             * Asynchronously resolve the selected configuration. This promise
             * will be rejected if the detected cloud configuration has no
             * valid configuration blocks.
             *
             * @returns {*}
             */
            resolveSelected: function () {
                return resolveSelectedConfiguration();
            },

            /**
             * Set the selected configuration. Note that you're going to have
             * to reload the entire application to make this work.
             */
            setSelected: function (selectedId) {
                $$persistentStorage.set(storageId, selectedId);
                deferSelected = null;
            }
        };
    });
