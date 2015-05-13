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
    function ($q, $http, $log, $location, $$persistentStorage, $modal) {
        'use strict';

        /**
         * The storage key used in $$persistentStorage to store our local
         * configuration.
         *
         * @type {string}
         */
        var configStorageKey = 'local-configuration';

        /**
         * The resolved configuration stored in our local storage.
         */
        var localConfig =
            JSON.parse($$persistentStorage.get(configStorageKey) || '[]');

        /**
         * The key we use in our persistent storage to keep track of the
         * selected id.
         */
        var selectedStorageKey = 'selected-cloud';

        /**
         * Saves a config value to the local storage.
         */
        function saveLocal() {
            $$persistentStorage.set(configStorageKey,
                JSON.stringify(localConfig));
        }

        /**
         * Removes a passed configuration from the local list.
         */
        function removeLocal(config) {
            for (var i = 0; i < localConfig.length; i++) {
                var c = localConfig[i];
                if (c.id === config.id) {
                    localConfig.splice(i, 1);
                    saveLocal();
                    break;
                }
            }
        }

        /**
         * Attempt to load an included configuration file.
         */
        function resolveConfigurationFile() {
            $log.info('Attempting to load parameters from ./config.json');
            var deferConfig = $q.defer();
            $http.get('./config.json').then(
                function (response) {
                    deferConfig.resolve(response);
                },
                function () {
                    $log.warn('Cannot load ./config.json, using defaults.');
                    deferConfig.resolve([]);
                }
            );
            return deferConfig.promise;
        }

        /**
         * Attempt to resolve configurations from localStorage.
         */
        function resolveLocalStorage() {
            $log.info('Attempting to load parameters from localStorage');
            var deferred = $q.defer();
            deferred.resolve(localConfig);
            return deferred.promise;
        }

        /**
         * Build default configuration for services on the local server.
         */
        function resolveAutodetect() {
            $log.info('Configuring local API endpoint.');
            var deferAutodetect = $q.defer();
            var ironicApi =
                $location.protocol() + '://' + $location.host() + ':6385/';

            $http.get(ironicApi).then(function (response) {
                var name = response.data.name || 'Local';
                var config = [
                    {
                        'id': 'localhost',
                        'name': name,
                        'ironic': {
                            'api': ironicApi
                        }
                    }
                ];
                deferAutodetect.resolve(config);
            }, function () {
                deferAutodetect.resolve([]);
            });
            return deferAutodetect.promise;
        }

        /**
         * Resolve all the configurations.
         */
        function resolveAllConfigurations() {
            var deferAll = $q.defer();

            // Resolve the configuration.
            $q.all({
                'config': resolveConfigurationFile(),
                'default': resolveAutodetect(),
                'local': resolveLocalStorage()
            }).then(function (results) {
                var fileConfigs = results.config;
                var defaultConfigs = results.default;
                var localConfigs = results.local;

                var config = [];

                function addConfig(c) {
                    if (c.hasOwnProperty('id')) {
                        config.push(c);
                    } else {
                        $log.warn('Config block missing "id" ' +
                        'field, ignoring.', c);
                    }
                }

                fileConfigs.forEach(addConfig);
                defaultConfigs.forEach(addConfig);
                localConfigs.forEach(addConfig);

                deferAll.resolve(config);
            }, function () {
                deferAll.resolve([]);
            });

            return deferAll.promise;
        }

        /**
         * Displays the local configuration add modal.
         */
        function addLocal() {
            var deferred = $q.defer();
            $modal.open({
                templateUrl: 'view/openstack/config_add.html',
                controller: 'ConfigurationAddController',
                backdrop: 'static',
                //keyboard: false,
                resolve: {
                    configuration: resolveAllConfigurations
                }
            }).result.then(function (newConfig) {
                    localConfig.push(newConfig);
                    saveLocal();
                    deferred.resolve(newConfig);
                }, function () {
                    deferred.reject();
                });

            return deferred.promise;
        }

        /**
         * This method throws the user into an infinite loop, requiring them to
         * install a configuration.
         */
        function requireAtLeastOneConfiguration() {
            var deferred = $q.defer();

            function requireAddLocal() {
                addLocal().then(
                    function () {
                        resolveAllConfigurations().then(function (configs) {
                            deferred.resolve(configs);
                        });
                    },
                    function () {
                        // Force them to do this until we have a valid
                        // configuration.
                        requireAddLocal();
                    }
                );
            }

            resolveAllConfigurations().then(function (configs) {
                if (configs.length === 0) {
                    requireAddLocal();
                } else {
                    deferred.resolve(configs);
                }
            });

            return deferred.promise;
        }

        /**
         * Resolve the current selected configuration.
         */
        function resolveSelectedConfiguration() {
            var deferSelected = $q.defer();

            var selectedId = $$persistentStorage.get(selectedStorageKey);

            requireAtLeastOneConfiguration().then(
                function (configs) {
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
                        $$persistentStorage.set(selectedStorageKey,
                            selectedId);
                        $log.debug('AutoSelecting cloud: ' + selectedId);
                    }
                    deferSelected.resolve(selectedConfig);
                }
            );

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
             * Asynchronously resolve the local configuration.
             */
            resolveConfigured: function () {
                return resolveConfigurationFile();
            },

            /**
             * Asynchronously resolve autodetected api's on the same domain.
             */
            resolveAutodetection: function () {
                return resolveAutodetect();
            },

            /**
             * Asynchronously resolve configurations in localStorage.
             */
            resolveLocal: function () {
                return resolveLocalStorage();
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
                $$persistentStorage.set(selectedStorageKey, selectedId);
            },

            /**
             * This method adds a new configuration to the application.
             */
            add: function () {
                return addLocal();
            },

            /**
             * This method removes a configuration from the application.
             *
             * @param config
             */
            remove: function (config) {
                return removeLocal(config);
            }
        };
    });

/**
 * This controller allows the creation of a new configuration.
 */
angular.module('openstack').controller('ConfigurationAddController',
    function ($scope, $state, $location, $$defaultConfiguration,
              $$configuration, $modalInstance, configuration) {
        'use strict';

        $scope.configuration = configuration;
        $scope.newConfiguration = angular.copy($$defaultConfiguration);

        $scope.location = {
            'host': $location.host(),
            'protocol': $location.protocol(),
            'port': $location.port()
        };

        $scope.save = function () {
            $scope.newConfiguration.id = $scope.newConfiguration.name;
            $modalInstance.close($scope.newConfiguration);
        };

        $scope.close = function () {
            $modalInstance.dismiss();
        };
    });
