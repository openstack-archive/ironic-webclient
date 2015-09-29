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
 * This resource acts as a resource-like service that provides cloud api configurations
 * from various optional sources. First, you may hardcode a configuration using
 * $$configurationProvider.$addConfig. Secondly, you may use the default configuration
 * as registered by peer libraries using $$configurationProvider.$registerDefault.
 * Thirdly, it can load a configuration from ./config.json. Lastly, it provides
 * a simple CRUD interface by which a user may manipulate configurations that
 * are persisted in a browser's persistent storage.
 *
 * An example configuration file follows:
 *
 * [{
 *     "name": "My Little Cloud",
 *     "ironic": {
 *          "apiRoot": "https://ironic.example.com:6385/"
 *     },
 *     "glance": {
 *          "apiRoot": "https://glance.example.com:9292/"
 *     }
 * }]
 */
angular.module('openstack').provider('$$configuration',
  function() {
    'use strict';

    var merge = angular.merge;
    var forEach = angular.forEach;

    /**
     * Promise variables, used to keep certain result sets in state.
     */
    var deferAll, deferConfig, deferStatic, deferDefault, deferLocal;

    /**
     * ID key for the persistent storage.
     *
     * @type {string}
     */
    var storageKey = '$$configuration';

    /**
     * Internal flag: Is the default configuration enabled?
     *
     * @type {boolean} True if enabled, otherwise false.
     */
    var enableDefault = false;

    /**
     * Internal flag: Is configuration loading enabled?
     *
     * @type {boolean} True if enabled, otherwise false.
     */
    var enableConfigLoad = false;

    /**
     * Internal flag: Is persisting via localStorage enabled?
     *
     * @type {boolean} True if enabled, otherwise false.
     */
    var enableLocalStorage = false;

    /**
     * A list of static configurations, added to the provider.
     *
     * @type {Array}
     */
    var staticConfigs = [];

    /**
     * The default configuration instance.
     *
     * @type {{}}
     */
    var defaultConfig = {
      'id': 'default',
      'name': 'Default',
      'source': 'default'
    };

    /**
     * Add a new configuration to the provider. Use this method if you are providing your
     * own configuration loading mechanism during application initialization, such as a
     * hardcoded configuration. For a user-provided configuration, we recommend you use
     * $$configuration.create({}); instead.
     *
     * @param configuration The configuration to add.
     */
    this.$addConfig = function(configuration) {
      configuration = angular.copy(configuration);
      configuration.source = 'static';
      staticConfigs.push(configuration);

      // Reset associated promises
      if (deferStatic) {
        deferStatic = null;
        deferAll = null;
      }
    };

    /**
     * Register a service's default API URL. This allows peer libraries, such as glance-apilib
     * or ironic-apilib, to set a 'default' location for their API.
     *
     * @param serviceName The name of the service to register. Example: 'ironic'.
     * @param serviceUrl The root url of the API.
     */
    this.$registerDefault = function(serviceName, serviceUrl) {
      defaultConfig[serviceName] = {
        'id': serviceName,
        'apiRoot': serviceUrl
      };

      if (deferDefault) {
        deferDefault = null;
        deferAll = null;
      }
    };

    /**
     * Enable, or disable, the default configuration mechanism. This mechanism assumes that peer
     * libraries, such as ironic-jslib or others, register an expected 'default' API root during
     * application initialization. These are provided under the 'default' id.
     *
     * This feature is disabled by default, enable it if you want your UI to permit automatic
     * creation of default configurations.
     *
     * @param {Boolean} enable Whether to enable the default configuration mechanism.
     */
    this.$enableDefault = function(enable) {
      enable = !!enable;
      // Only change things if things have changed
      if (enable !== enableDefault) {
        enableDefault = enable;

        // Reset associated promises
        if (deferDefault) {
          deferDefault = null;
          deferAll = null;
        }
      }
    };

    /**
     * Enable, or disable, the configuration loading mechanism. This mechanism attempts to load
     * a list of cloud configurations from a ./config.json file that lives adjacent to your user
     * interface. This feature is disabled by default, enable it if you want to configure your
     * cloud with a static config.json file.
     *
     * @param {Boolean} enable Whether to enable configuration loading.
     */
    this.$enableConfigLoad = function(enable) {
      enable = !!enable;
      // Only change things if things have changed
      if (enable !== enableConfigLoad) {
        enableConfigLoad = enable;

        // Reset associated promises
        if (deferConfig) {
          deferConfig = null;
          deferAll = null;
        }
      }
    };

    /**
     * Enable, or disable, loading cloud configuration from a browser's LocalStorage. This may
     * be used either to drive a user-provided configuration UI, or to read a configuration that
     * is shared between applications on the same domain.
     *
     * @param {Boolean} enable Whether to enable localStorage configurations.
     */
    this.$enableLocalStorage = function(enable) {
      enable = !!enable;
      // Only change things if things have changed
      if (enable !== enableLocalStorage) {
        enableLocalStorage = enable;

        // Reset associated promises
        if (deferLocal) {
          deferLocal = null;
          deferAll = null;
        }
      }
    };

    /**
     * Create a shallow copy of an object without persisting private methods.
     *
     * @param src The source object.
     * @returns {*|{}}
     */
    function cleanCopy (src) {
      var dst = {};

      for (var key in src) {
        if (src.hasOwnProperty(key) && !(key.charAt(0) === '$')) {
          dst[key] = src[key];
        }
      }

      return dst;
    }

    /**
     * Return the $$configuration service.
     */
    this.$get = function($q, $$persistentStorage, $log, $http) {

      /**
       * Store a list of data in local persistent storage.
       *
       * @param list An array of config objects.
       */
      function saveLocal (list) {
        $$persistentStorage.set(storageKey, list);
        deferLocal = null;
        deferAll = null;
      }

      /**
       * Retrieve all configurations from the browser local storage, if enabled.
       *
       * @returns {promise}
       */
      function resolveLocal () {
        if (!deferLocal) {
          deferLocal = $q.defer();
          if (enableLocalStorage) {
            var configs = $$persistentStorage.get(storageKey) || [];
            forEach(configs, function(config) {
              config.source = 'local';
            });
            deferLocal.resolve(configs);
          } else {
            deferLocal.resolve([]);
          }
        }
        return deferLocal.promise;
      }

      /**
       * Retrieve all configurations from our various storage mechanisms.
       *
       * @returns {promise}
       */
      function resolveAll () {
        // Only trigger this if the promise has been cleared.
        if (!deferAll) {
          deferAll = $q.defer();

          $q.all({
            'local': resolveLocal(),
            'config': resolveConfig(),
            'default': resolveDefault(),
            'static': resolveStatic()
          }).then(function(results) {
            var list = [];
            forEach(results.local, function(config) {
              list.push(config);
            });
            forEach(results.config, function(config) {
              list.push(config);
            });
            forEach(results.default, function(config) {
              list.push(config);
            });
            forEach(results.static, function(config) {
              list.push(config);
            });
            deferAll.resolve(list);
          });
        }

        return deferAll.promise;
      }

      /**
       * Resolve configuration files from the ./config.json file.
       *
       * @returns {promise}
       */
      function resolveConfig () {
        if (!deferConfig) {
          deferConfig = $q.defer();

          if (!enableConfigLoad) {
            deferConfig.resolve([]);
          } else {
            $log.info('Attempting to load parameters from ./config.json');
            $http.get('./config.json').then(
              function(response) {

                // The result must be an array.
                if (!angular.isArray(response.data)) {
                  $log.warn('Content of ./config.json must be a valid JSON array.');
                  response.data = [];
                }

                forEach(response.data, function(config) {
                  config.source = 'host';
                });

                deferConfig.resolve(response.data);
              },
              function() {
                $log.warn('Cannot load ./config.json, using defaults.');
                deferConfig.resolve([]);
              }
            );
          }
        }
        return deferConfig.promise;
      }

      /**
       * Resolve the default configuration.
       *
       * @returns {promise}
       */
      function resolveDefault () {
        if (!deferDefault) {
          deferDefault = $q.defer();
          if (enableDefault) {
            deferDefault.resolve([defaultConfig]);
          } else {
            deferDefault.resolve([]);
          }
        }

        return deferDefault.promise;
      }

      /**
       * Resolve a list of configurations added to the services at config time.
       *
       * @returns {promise}
       */
      function resolveStatic () {
        if (!deferStatic) {
          deferStatic = $q.defer();
          deferStatic.resolve(staticConfigs);
        }
        return deferStatic.promise;
      }

      /**
       * Create a new local configuration. This requires that localStorage is enabled.
       *
       * @param newConfig The configuration to create.
       */
      function createConfig (newConfig) {
        // Create a result object
        var deferred = $q.defer();

        // Decorate the result resource with necessary bits.
        newConfig = resourceify(newConfig, deferred.promise);

        // We must have local storage enabled.
        if (!enableLocalStorage) {
          deferred.reject('local_storage_disabled');
          return newConfig;
        }

        // The user must provide an id property.
        if (!newConfig.id) {
          deferred.reject('no_id_provided');
          return newConfig;
        }

        // Resolve both all and local.
        $q.all({
          'all': resolveAll(),
          'local': resolveLocal()
        }).then(function(results) {
          // Check for duplicate ID's, reject if one exists.
          for (var i = 0; i < results.all.length; i++) {
            if (newConfig.id === results.all[i].id) {
              deferred.reject('duplicate_id');
              return;
            }
          }

          // Add the new config.
          results.local.push(cleanCopy(newConfig));

          // Stash the results
          saveLocal(results.local);

          // resolve and exit
          deferred.resolve(newConfig);
        });

        return newConfig;
      }

      /**
       * Update a new locally stored configuration.
       *
       * @param config The configuration object to update.
       */
      function updateConfig (config) {
        var deferred = $q.defer();
        config = resourceify(config, deferred.promise);

        // We must have local storage enabled.
        if (!enableLocalStorage) {
          deferred.reject('local_storage_disabled');
          return config;
        }

        // Load local configurations
        resolveLocal().then(
          function(results) {
            // Try to find the matching id.
            for (var i = 0; i < results.length; i++) {
              var storedConfig = results[i];
              if (config.id === storedConfig.id) {
                // Merge the new values onto the stored config.
                storedConfig = merge(storedConfig, cleanCopy(config));

                // Stash the results
                saveLocal(results);

                // Resolve the promise
                deferred.resolve(config);
                return;
              }
            }
            deferred.reject('not_found');
          });

        return config;
      }

      /**
       * Retrieve a configuration by ID.
       *
       * @param config The configuration object to decorate with the result.
       */
      function readConfig (config) {
        var deferred = $q.defer();
        config = resourceify(config, deferred.promise);

        // Force the user to provide an ID.
        if (!config.id) {
          deferred.reject('no_id_provided');
          return config;
        }

        // Load everything, then...
        resolveAll().then(
          function(results) {
            // Try to find the matching id.
            for (var i = 0; i < results.length; i++) {
              var storedConfig = results[i];
              if (config.id === storedConfig.id) {
                // Merge values onto the config.
                merge(config, cleanCopy(storedConfig));
                deferred.resolve(config);
                return;
              }
            }
            deferred.reject('not_found');
          });

        return config;
      }

      /**
       * Remove a locally stored configuration from the cache.
       *
       * @param config The configuration object to remove.
       */
      function removeConfig (config) {
        var deferred = $q.defer();
        config = resourceify(config, deferred.promise);

        // We must have local storage enabled.
        if (!enableLocalStorage) {
          deferred.reject('local_storage_disabled');
          return config;
        }

        // Load local configurations
        resolveLocal().then(
          function(results) {
            // Try to find the matching id.
            for (var i = 0; i < results.length; i++) {
              var storedConfig = results[i];
              if (storedConfig.id === config.id) {

                // Remove the config from local storage.
                results.splice(i, 1);

                // Stash the results
                saveLocal(results);

                // Resolve the promise and exit
                deferred.resolve(config);
                return;
              }
            }
            deferred.reject('not_found');
          });
        return config;
      }

      /**
       * This method decorates a raw resource with manipulation methods like $delete, $update,
       * etc. These convenience methods permit individual instance manipulation.
       *
       * @param instance The instance to decorate.
       * @param promise The promise to apply.
       *
       * @return {{}} A clone of the instance, with $ methods added.
       */
      function resourceify (instance, promise) {
        instance.$promise = promise;

        // Set the initial resolved, and keep it up to date.
        instance.$resolved = false;
        instance.$promise.then(function() {
          instance.$resolved = true;
        }, function() {
          instance.$resolved = true;
        });

        instance.$remove = function() {
          return removeConfig(instance);
        };
        instance.$create = function() {
          return createConfig(instance);
        };
        instance.$update = function() {
          return updateConfig(instance);
        };
        instance.$read = function() {
          return readConfig(instance);
        };
        return instance;
      }

      return {
        /**
         * Get a list of all configurations.
         *
         * @returns {{}} A list of configurations.
         */
        'query': function() {
          // Start with the promise
          var listDeferred = $q.defer();

          // Build a resource
          var list = resourceify([], listDeferred.promise);

          // Resolve all the resources, then resolve the list promise.
          resolveAll().then(
            function(results) {
              // Load cloned configs into the result array.
              forEach(results, function(config) {
                var rDeferred = $q.defer();
                var resource = resourceify(cleanCopy(config), rDeferred.promise);
                listDeferred.promise.then(
                  function() {
                    rDeferred.resolve(resource);
                  });
                list.push(resource);
              });

              listDeferred.resolve(list);
            });
          return list;
        },

        /**
         * Create a new configuration.
         *
         * @param {{}} configuration The configuration to add.
         */
        'create': function(configuration) {
          return createConfig(configuration);
        },

        /**
         * Retrieve a specific configuration by ID.
         *
         * @param id
         */
        'read': function(id) {
          return readConfig({'id': id});
        },

        /**
         * Update a configuration in the loaded cache. This will error if the user attempts to
         * update a configuration from a static provider - say the config file.
         *
         * @param configuration
         */
        'update': function(configuration) {
          return updateConfig(configuration);
        },

        /**
         * Remove a particular configuration from the configuration list.
         *
         * @param id The ID to remove.
         */
        'remove': function(id) {
          return removeConfig({'id': id});
        }
      };
    };
  }
);
