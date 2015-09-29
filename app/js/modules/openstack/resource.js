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
 * The resource cache acts as a centralized location where different services'
 * service abstractions may live. During the configuration phase, each
 * loaded API is expected to register a factory with the cache, which will
 * be later queried to build instances of resources for different cloud
 * configuration parameters.
 *
 * @deprecated
 */
angular.module('openstack').provider('$$resourceFactory',
  function () {
    'use strict';

    /**
     * Cache of all the factories.
     *
     * @type {{}}
     */
    var serviceFactoryCache = {};

    /**
     * Cache of all the constructed services by configName.
     *
     * @type {{}}
     */
    var apiCache = {};

    /**
     * Add a service factory for a given openstack service to the central
     * service factory. For each service, it will have its $build method
     * invoked with a specific global configuration object, and the name of
     * the resource that was requested.
     *
     * @param {String} serviceName The name of the service.
     * @param {Function} factory The factory implementation. Must be callable.
     * @returns {void}
     */
    this.$addServiceFactory = function (serviceName, factory) {
      serviceFactoryCache[serviceName] = factory;
    };

    /**
     * The factory's provider. Creates a singleton instance of the
     * $$resourceFactory service that permits the creation of different
     * API's.
     *
     * @param {*} $$configuration Injected configuration service.
     * @param {*} $log Injected log abstraction.
     * @param {*} $injector Injected injector.
     * @returns {{build: Function}} The constructed service.
     */
    this.$get = function resourceFactoryProvider ($$configuration, $log,
                                                  $injector, $$selectedConfiguration) {

      /**
       * Get the cache of services available for a specific API root.
       *
       * @param {String} baseUri The root URI for the service cache.
       * @returns {*} The in-memory service cache.
       */
      function getServiceCache (baseUri) {
        if (!apiCache.hasOwnProperty(baseUri)) {
          apiCache[baseUri] = {};
        }
        return apiCache[baseUri];
      }

      /**
       * An internal resource factory, that builds ngResource instances in
       * accordance to the provided configuration.
       *
       * @param {String} serviceName A unique key under which this resource should be cached.
       * @param {String} baseUri The API's Base URI.
       * @param {String} resourceName The name of the resource to construct.
       * @returns {*} A constructed service.
       */
      function resourceFactory (serviceName, baseUri, resourceName) {

        // Get the appropriate resource factory.
        if (!serviceFactoryCache.hasOwnProperty(serviceName)) {
          $log.error('No resource factory for service [' +
            serviceName + '] was registered. Did you import the ' +
            'library?');
        }

        /**
         * Build the service.
         */
        var factoryBuilder = serviceFactoryCache[serviceName];
        var factory = $injector.invoke(factoryBuilder);
        return factory(baseUri, resourceName);
      }

      /**
       * Retrieve a specific resource for a given service in a given
       * configuration scope.
       *
       * @param {String} serviceName The name of the service. e.g. 'ironic'.
       * @param {String} resourceName The name of the root resource. e.g. 'node'
       * @returns {*} The constructed service.
       */
      function getService (serviceName, resourceName) {

        var config = $$selectedConfiguration.get();
        var baseUri = config[serviceName].apiRoot;
        var cache = getServiceCache(baseUri);

        if (!cache.hasOwnProperty(resourceName)) {
          cache[resourceName] =
            resourceFactory(serviceName, baseUri, resourceName);
        }
        return cache[resourceName];
      }

      return {
        /**
         * Return an instance of a service for the given configuration
         * name, service name, and resource name.
         *
         * @param {String} serviceName The name of the service in the configuration.
         * @param {String} resourceName The name of the resource to construct.
         * @returns {*} A singleton instance of the service.
         */
        'build': function (serviceName, resourceName) {
          return getService(serviceName, resourceName);
        }
      };
    };
  });
