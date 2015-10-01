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
 * This file provides an implementation of the storage API, backed by cookies.
 * This particular implementation is not intelligent: It will access the
 * cookie for this domain, as configured by the $cookieProvider, and will
 * grant access to all values stored this way.
 */
angular.module('openstack').factory('$$cookieStorage',
  function($cookies) {
    'use strict';

    return {

      /**
       * Is this storage type supported?
       *
       * @returns {boolean} True if it is supported, otherwise false.
       */
      'isSupported': function() {
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
      'set': function(key, value) {
        $cookies.put(key, angular.toJson(value));
        return value;
      },

      /**
       * Retrieve a value from this storage provider.
       *
       * @param {String} key The key to retrieve.
       * @return {*|undefined} The value, or undefined if it is not set.
       */
      'get': function(key) {
        var result = angular.fromJson($cookies.get(key));
        if (result) {
          return result;
        }
      },

      /**
       * Remove a specific value from the storage provider.
       *
       * @param {String} key The key to remove.
       * @returns {void}
       */
      'remove': function(key) {
        $cookies.remove(key);
      },

      /**
       * Return all the keys currently registered.
       *
       * @returns {Array} An array of all registered keys.
       */
      'keys': function() {
        var all = $cookies.getAll();
        var keys = [];
        /*eslint-disable guard-for-in*/
        for (var key in all) {
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
      'clearAll': function() {
        var all = $cookies.getAll();
        /*eslint-disable guard-for-in*/
        for (var key in all) {
          $cookies.remove(key);
        }
        /*eslint-enable guard-for-in*/
      },

      /**
       * Return the size of the current memory storage.
       *
       * @returns {number} The number of keys in storage.
       */
      'length': function() {
        return this.keys().length;
      }
    };
  });
