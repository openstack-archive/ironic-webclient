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
 * A $$sessionStorage service behind a common API. If sessionStorage is not
 * supported, this will log a warning to the console. If you want a provider
 * that gracefully degrades, use $$persistentStorage.
 */
angular.module('openstack').factory('$$sessionStorage',
  function($window, $log) {
    'use strict';

    /**
     * Detect whether sessionStorage is supported, and make sure we can
     * write to it.
     */
    var isSupported = (function() {

      // Does it exist?
      if (!$window.sessionStorage) {
        return false;
      }

      // Can we write to it?
      var testKey = '__' + Math.round(Math.random() * 1e7);
      try {
        $window.sessionStorage.setItem(testKey, '');
        $window.sessionStorage.removeItem(testKey);
        return true;
      } catch (e) {
        return false;
      }
    })();

    return {

      /**
       * Is this storage type supported?
       *
       * @returns {boolean} True if it is supported, otherwise false.
       */
      'isSupported': function() {
        return isSupported;
      },

      /**
       * Set a value of the provided key. If the
       * value already exists it will be overwritten.
       *
       * @param {String} key The key to store the value at.
       * @param {*} value The value to store.
       * @return {*} The stored value.
       */
      'set': function(key, value) {
        if (isSupported) {
          $window.sessionStorage.setItem(key, angular.toJson(value));
          return value;
        }
        $log.warn('$$sessionStorage not supported');
      },

      /**
       * Retrieve a value from this storage provider.
       *
       * @param {String} key The key to retrieve.
       * @return {*|undefined} The value, or undefined if it is not set.
       */
      'get': function(key) {
        if (isSupported) {
          var result = angular.fromJson($window.sessionStorage.getItem(key));
          if (result) {
            return result;
          }
        } else {
          $log.warn('$$sessionStorage not supported');
        }
      },

      /**
       * Remove a specific value from the storage provider.
       *
       * @param {String} key The key to remove.
       * @returns {void}
       */
      'remove': function(key) {
        if (isSupported) {
          return $window.sessionStorage.removeItem(key);
        }
        $log.warn('$$sessionStorage not supported');
      },

      /**
       * Return all the keys currently registered.
       *
       * @returns {Array} An array of all registered keys.
       */
      'keys': function() {
        if (isSupported) {
          var keys = [];
          for (var i = 0; i < $window.sessionStorage.length; i++) {
            keys.push($window.sessionStorage.key(i));
          }
          return keys;
        }
        $log.warn('$$sessionStorage not supported');
        return [];
      },

      /**
       * Remove everything from the memory storage mechanism.
       *
       * @returns {void}
       */
      'clearAll': function() {
        if (isSupported) {
          var keys = this.keys();
          for (var i = 0; i < keys.length; i++) {
            this.remove(keys[i]);
          }
          return;
        }
        $log.warn('$$sessionStorage not supported');
      },

      /**
       * Return the size of the current memory storage.
       *
       * @returns {number} The number of keys in storage.
       */
      'length': function() {
        if (isSupported) {
          return $window.sessionStorage.length;
        }
        $log.warn('$$sessionStorage not supported');
        return 0;
      }
    };
  });
