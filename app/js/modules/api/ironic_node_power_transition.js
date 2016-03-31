/*
 * Copyright (c) 2015 Hewlett-Packard Enterprise Development Company, L.P.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

/**
 * IronicNodePowerTransition is a mock API that returns the list of valid power
 * transitions for nodes.
 */
angular.module('ironic.api').factory('IronicNodePowerTransition',
  function($q) {
    'use strict';

    // Build a dummy resource. The API will return this wrapped in an additional 'transitions'
    // field, but we'll just use the raw array.
    var transitions = [
      {
        from_state: "power on",
        event: "power off",
        target_state: "power off",
        actor: "user"
      },
      {
        from_state: "power off",
        event: "power on",
        target_state: "power on",
        actor: "user"
      },
      {
        from_state: "power on",
        event: "reboot",
        target_state: "rebooting",
        actor: "user"
      },
      {
        from_state: "rebooting",
        event: "power on",
        target_state: "power on",
        actor: "conductor"
      }
    ];

    return {
      query: function(params, successHandler, errorHandler) {
        var deferred = $q.defer();

        // Build our result array.
        var queryResults = [];
        queryResults.$promise = deferred.promise;
        queryResults.$resolved = false;
        deferred.promise.then(function(results) {
          angular.forEach(results, function(result) {
            queryResults.push(result);
          });
        });
        deferred.promise.finally(function() {
          queryResults.$resolved = true;
        });

        // Check for a filter
        if (params) {
          var filteredResults = transitions.filter(function(item) {
            var approved = true;
            angular.forEach(params, function(value, key) {
              if (!item.hasOwnProperty(key) || item[key] !== value) {
                approved = false;
              }
            });

            return approved;
          });
          deferred.resolve(filteredResults);
        } else {
          deferred.resolve(transitions);
        }

        queryResults.$promise.then(successHandler || null, errorHandler || null);

        return queryResults;
      }
    };
  });
