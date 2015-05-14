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
         * @param serviceName The name of the service.
         * @param factory The factory implementation. Must be callable.
         */
        this.$addServiceFactory = function (serviceName, factory) {
            serviceFactoryCache[serviceName] = factory;
        };

        /**
         * The factory's provider. Creates a singleton instance of the
         * $$resourceFactory service that permits the creation of different
         * API's.
         *
         * @param $$configuration Injected configuration service.
         * @param $log Injected log abstraction.
         * @param $log Injected injector.
         * @returns {{build: Function}}
         */
        this.$get = function resourceFactoryProvider($$configuration, $log,
                                                     $injector) {

            /**
             * Get the cache of services available for a specific API root.
             *
             * @param baseUri The root URI for the service cache.
             * @returns {*}
             */
            function getServiceCache(baseUri) {
                if (!apiCache.hasOwnProperty(baseUri)) {
                    apiCache[baseUri] = {};
                }
                return apiCache[baseUri];
            }

            /**
             * An internal resource factory, that builds ngResource instances in
             * accordance to the provided configuration.
             *
             * @param serviceName
             * @param baseUri
             * @param resourceName
             * @returns {*}
             */
            function resourceFactory(serviceName, baseUri, resourceName) {

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
             * @param serviceName The name of the service. e.g. 'ironic'.
             * @param resourceName The name of the root resource. e.g. 'chassis'
             */
            function getService(serviceName, resourceName) {
                var baseUri = $$configuration.getApiBase(serviceName);
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
                 * @param configName
                 * @param serviceName
                 * @param resourceName
                 * @returns {*}
                 */
                'build': function (serviceName, resourceName) {
                    return getService(serviceName, resourceName);
                }
            };
        };
    });