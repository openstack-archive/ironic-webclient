/*
 * Copyright (c) 2015 Hewlett-Packard Development Company, L.P.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License'); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

/**
 * This provides a memory-based key/value storage mechanism. It's provided as
 * a fallback option for all other storage mechanisms, to prevent unexpected
 * runtime failures.
 */
angular.module('openstack').factory('$$memoryStorage',
  function() {
    'use strict';

    var memoryStorage = {};

    return {

      /**
       * Is this storage type supported?
       *
       * @returns {boolean} True if it is supported, otherwise false.
       */
      isSupported: function() {
        return true;
      },

      /**
       * Set a value to the provided key in memory storage. If the
       * value already exists it will be overwritten.
       *
       * @param {String} key The key to store the value at.
       * @param {*} value The value to store.
       * @return {*} The stored value.
       */
      set: function(key, value) {
        memoryStorage[key] = value;

        return value;
      },

      /**
       * Retrieve a value from this storage provider.
       *
       * @param {String} key The key to retrieve.
       * @return {*|undefined} The value, or undefined if it is not set.
       */
      get: function(key) {
        if (memoryStorage.hasOwnProperty(key)) {
          return memoryStorage[key];
        }
      },

      /**
       * Remove a specific value from the storage provider.
       *
       * @param {String} key The key to remove.
       * @returns {void}
       */
      remove: function(key) {
        delete memoryStorage[key];
      },

      /**
       * Return all the keys currently registered.
       *
       * @returns {Array} An array of all registered keys.
       */
      keys: function() {
        var keys = [];
        /*eslint-disable guard-for-in*/
        for (var key in memoryStorage) {
          keys.push(key);
        }
        /*eslint-enable guard-for-in*/
        return keys;
      },

      /**
       * Remove everything from the memory storage mechanism.
       *
       * @returns {void}
       */
      clearAll: function() {
        var keys = [];
        /*eslint-disable guard-for-in*/
        for (var key in memoryStorage) {
          keys.push(key);
        }
        /*eslint-enable guard-for-in*/

        for (var i = 0; i < keys.length; i++) {
          delete memoryStorage[keys[i]];
        }
      },

      /**
       * Return the size of the current memory storage.
       *
       * @returns {number} The number of keys in storage.
       */
      length: function() {
        return this.keys().length;
      }
    };
  });
