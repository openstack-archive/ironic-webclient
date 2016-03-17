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
 * The resource cache acts as a centralized location where different services' resource
 * instances may be stored. It plays a central role in multi-cloud environments, as a resource
 * abstraction - say IronicNode - can create and cache the actual ngResource instances for N>1
 * configured ironic endpoints.
 *
 * In order to maintain flexibility, it does not build resources, it only accepts preconstructed
 * instances. It is strongly recommended that you store your resource instances using the root
 * URI of the API to which your instance is talking, so that 'https://somecloud.com:6385/v1/nodes'
 * will be stored separately from 'https://someothercloud.com:6385/v1/nodes'.
 */
angular.module('openstack').factory('$$resourceCache',
  function() {
    'use strict';

    /**
     * Cache of all the resource instances.
     *
     * @type {{}}
     */
    var resourceCache = {};

    return {

      /**
       * Store a resource instance in the cache.
       *
       * @param {String} uri The root uri of the resource.
       * @param {*} resource The resource to store.
       * @return {*} The stored resource.
       */
      set: function(uri, resource) {
        resourceCache[uri] = resource;
        return resource;
      },

      /**
       * Retrieve a resource instance from the cache.
       *
       * @param {String} uri The uri of the resource to retrieve.
       * @return {*|undefined} The resource, or undefined.
       */
      get: function(uri) {
        if (resourceCache[uri]) {
          return resourceCache[uri];
        }
      },

      /**
       * Check whether or not a resource is in the cache.
       *
       * @param {String} uri The uri of the resource to check.
       * @return {true|false} Whether this resource has already been cached.
       */
      has: function(uri) {
        return resourceCache.hasOwnProperty(uri);
      },

      /**
       * Remove a specific resource from the cache.
       *
       * @param {String} uri The uri of the resource to remove.
       * @returns {void}
       */
      remove: function(uri) {
        if (resourceCache.hasOwnProperty(uri)) {
          delete resourceCache[uri];
        }
      },

      /**
       * Return all the uri keys currently registered.
       *
       * @returns {Array} An array of all registered uri keys.
       */
      keys: function() {
        var keys = [];
        /*eslint-disable guard-for-in*/
        for (var key in resourceCache) {
          keys.push(key);
        }
        /*eslint-enable guard-for-in*/
        return keys;
      },

      /**
       * Remove everything from the cache.
       *
       * @returns {void}
       */
      clearAll: function() {
        var keys = this.keys();
        for (var i = 0; i < keys.length; i++) {
          delete resourceCache[keys[i]];
        }
      },

      /**
       * Return the number of resources in the cache.
       *
       * @returns {number} The number of resources cached.
       */
      length: function() {
        return this.keys().length;
      }
    };
  });
