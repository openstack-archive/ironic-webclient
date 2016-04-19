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
 * IronicNodeProvisionTransition is a mock API that returns the transitions list for
 * the ironic state machine. It is intended to be supplanted when the work for
 * https://review.openstack.org/#/c/224022/ is completed, though it may continue
 * to exist for legacy API microversions.
 */
angular.module('ironic.api').factory('IronicNodeProvisionTransition',
  function($q) {
    'use strict';

    // Build a dummy resource. The API will return this wrapped in an additional 'transitions'
    // field, but we'll just use the raw array.
    var transitions = [
      {
        from_state: "active",
        event: "rebuild",
        target_state: "deploying",
        actor: "user"
      },
      {
        from_state: "active",
        event: "delete",
        target_state: "deleting",
        actor: "user"
      },
      {
        from_state: "available",
        event: "manage",
        target_state: "manageable",
        actor: "user"
      },
      {
        from_state: "available",
        event: "active",
        target_state: "deploying",
        actor: "user"
      },
      {
        from_state: "clean failed",
        event: "manage",
        target_state: "manageable",
        actor: "user"
      },
      {
        from_state: "clean wait",
        event: "fail",
        target_state: "clean failed",
        actor: "conductor"
      },
      {
        from_state: "clean wait",
        event: "abort",
        target_state: "clean failed",
        actor: "conductor"
      },
      {
        from_state: "clean wait",
        event: "resume",
        target_state: "cleaning",
        actor: "conductor"
      },
      {
        from_state: "deleting",
        event: "clean",
        target_state: "cleaning",
        actor: "conductor"
      },
      {
        from_state: "deleting",
        event: "error",
        target_state: "error",
        actor: "conductor"
      },
      {
        from_state: "deploy failed",
        event: "rebuild",
        target_state: "deploying",
        actor: "user"
      },
      {
        from_state: "deploy failed",
        event: "delete",
        target_state: "deleting",
        actor: "user"
      },
      {
        from_state: "deploy failed",
        event: "active",
        target_state: "deploying",
        actor: "user"
      },
      {
        from_state: "wait call-back",
        event: "delete",
        target_state: "deleting",
        actor: "conductor"
      },
      {
        from_state: "wait call-back",
        event: "resume",
        target_state: "deploying",
        actor: "conductor"
      },
      {
        from_state: "wait call-back",
        event: "fail",
        target_state: "deploy failed",
        actor: "conductor"
      },
      {
        from_state: "error",
        event: "rebuild",
        target_state: "deploying",
        actor: "user"
      },
      {
        from_state: "error",
        event: "delete",
        target_state: "deleting",
        actor: "user"
      },
      {
        from_state: "enroll",
        event: "manage",
        target_state: "verifying",
        actor: "user"
      },
      {
        from_state: "inspect failed",
        event: "inspect",
        target_state: "inspecting",
        actor: "user"
      },
      {
        from_state: "inspect failed",
        event: "manage",
        target_state: "manageable",
        actor: "user"
      },
      {
        from_state: "manageable",
        event: "inspect",
        target_state: "inspecting",
        actor: "user"
      },
      {
        from_state: "manageable",
        event: "provide",
        target_state: "cleaning",
        actor: "user"
      },
      {
        from_state: "manageable",
        event: "clean",
        target_state: "cleaning",
        actor: "user"
      },
      {
        from_state: "verifying",
        event: "fail",
        target_state: "enroll",
        actor: "conductor"
      },
      {
        from_state: "verifying",
        event: "done",
        target_state: "manageable",
        actor: "conductor"
      },
      {
        from_state: "inspecting",
        event: "fail",
        target_state: "inspect failed",
        actor: "conductor"
      },
      {
        from_state: "inspecting",
        event: "done",
        target_state: "manageable",
        actor: "conductor"
      },
      {
        from_state: "cleaning",
        event: "manage",
        target_state: "manageable",
        actor: "conductor"
      },
      {
        from_state: "cleaning",
        event: "wait",
        target_state: "clean wait",
        actor: "conductor"
      },
      {
        from_state: "cleaning",
        event: "fail",
        target_state: "clean failed",
        actor: "conductor"
      },
      {
        from_state: "cleaning",
        event: "done",
        target_state: "available",
        actor: "conductor"
      },
      {
        from_state: "deploying",
        event: "fail",
        target_state: "deploy failed",
        actor: "conductor"
      },
      {
        from_state: "deploying",
        event: "wait",
        target_state: "wait call-back",
        actor: "conductor"
      },
      {
        from_state: "deploying",
        event: "done",
        target_state: "active",
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
