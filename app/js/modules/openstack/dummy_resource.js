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
 * The $$dummyResource component is a placeholder, which simulates the ngResource API. It does
 * nothing on its own, and should only be used in situations where a more appropriate resource
 * could not be resolved.
 */
angular.module('openstack').factory('$$dummyResource',
  function($q) {
    'use strict';

    /**
     * Apply common resource-like behavior, and instantly reject the promise.
     *
     * @param {*} resource An object to decorate.
     * @returns {*} The decorated instance.
     */
    function resourceify (resource) {
      var deferred = $q.defer();
      resource.$promise = deferred.promise;
      resource.$resolved = false;

      resource.$promise.finally(function() {
        resource.$resolved = true;
      });
      deferred.reject('dummy_resource');
      return resource;
    }

    return {
      query: function() {
        return resourceify([]);
      },
      create: function() {
        return resourceify({});
      },
      read: function() {
        return resourceify({});
      },
      update: function() {
        return resourceify({});
      },
      remove: function() {
        return resourceify({});
      }
    };
  });
