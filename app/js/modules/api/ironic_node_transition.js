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
 * IronicNodeTransition is a mock API that returns the transitions list for
 * the ironic state machine. It is intended to be supplanted when the work for
 * https://review.openstack.org/#/c/224022/ is completed, though it may continue
 * to exist for legacy API microversions.
 */
angular.module('ironic.api').factory('IronicNodeTransition',
  function($q) {
    'use strict';

    // Build a dummy resource. The API will return this wrapped in an additional 'transitions'
    // field, but we'll just use the raw array.
    var transitions = [
      {
        "from": "active",
        "event": "rebuild",
        "target": "deploying",
        "actor": "user"
      },
      {
        "from": "active",
        "event": "delete",
        "target": "deleting",
        "actor": "user"
      },
      {
        "from": "available",
        "event": "manage",
        "target": "manageable",
        "actor": "user"
      },
      {
        "from": "available",
        "event": "deploy",
        "target": "deploying",
        "actor": "user"
      },
      {
        "from": "clean failed",
        "event": "manage",
        "target": "manageable",
        "actor": "user"
      },
      {
        "from": "clean wait",
        "event": "fail",
        "target": "clean failed",
        "actor": "conductor"
      },
      {
        "from": "clean wait",
        "event": "abort",
        "target": "clean failed",
        "actor": "conductor"
      },
      {
        "from": "clean wait",
        "event": "resume",
        "target": "cleaning",
        "actor": "conductor"
      },
      {
        "from": "deleting",
        "event": "clean",
        "target": "cleaning",
        "actor": "conductor"
      },
      {
        "from": "deleting",
        "event": "error",
        "target": "error",
        "actor": "conductor"
      },
      {
        "from": "deploy failed",
        "event": "rebuild",
        "target": "deploying",
        "actor": "user"
      },
      {
        "from": "deploy failed",
        "event": "delete",
        "target": "deleting",
        "actor": "user"
      },
      {
        "from": "deploy failed",
        "event": "deploy",
        "target": "deploying",
        "actor": "user"
      },
      {
        "from": "wait call-back",
        "event": "delete",
        "target": "deleting",
        "actor": "conductor"
      },
      {
        "from": "wait call-back",
        "event": "resume",
        "target": "deploying",
        "actor": "conductor"
      },
      {
        "from": "wait call-back",
        "event": "fail",
        "target": "deploy failed",
        "actor": "conductor"
      },
      {
        "from": "error",
        "event": "rebuild",
        "target": "deploying",
        "actor": "user"
      },
      {
        "from": "error",
        "event": "delete",
        "target": "deleting",
        "actor": "user"
      },
      {
        "from": "enroll",
        "event": "manage",
        "target": "verifying",
        "actor": "user"
      },
      {
        "from": "inspect failed",
        "event": "inspect",
        "target": "inspecting",
        "actor": "user"
      },
      {
        "from": "inspect failed",
        "event": "manage",
        "target": "manageable",
        "actor": "user"
      },
      {
        "from": "manageable",
        "event": "inspect",
        "target": "inspecting",
        "actor": "user"
      },
      {
        "from": "manageable",
        "event": "provide",
        "target": "cleaning",
        "actor": "user"
      },
      {
        "from": "manageable",
        "event": "clean",
        "target": "cleaning",
        "actor": "user"
      },
      {
        "from": "verifying",
        "event": "fail",
        "target": "enroll",
        "actor": "conductor"
      },
      {
        "from": "verifying",
        "event": "done",
        "target": "manageable",
        "actor": "conductor"
      },
      {
        "from": "inspecting",
        "event": "fail",
        "target": "inspect failed",
        "actor": "conductor"
      },
      {
        "from": "inspecting",
        "event": "done",
        "target": "manageable",
        "actor": "conductor"
      },
      {
        "from": "cleaning",
        "event": "manage",
        "target": "manageable",
        "actor": "conductor"
      },
      {
        "from": "cleaning",
        "event": "wait",
        "target": "clean wait",
        "actor": "conductor"
      },
      {
        "from": "cleaning",
        "event": "fail",
        "target": "clean failed",
        "actor": "conductor"
      },
      {
        "from": "cleaning",
        "event": "done",
        "target": "available",
        "actor": "conductor"
      },
      {
        "from": "deploying",
        "event": "fail",
        "target": "deploy failed",
        "actor": "conductor"
      },
      {
        "from": "deploying",
        "event": "wait",
        "target": "wait call-back",
        "actor": "conductor"
      },
      {
        "from": "deploying",
        "event": "done",
        "target": "active",
        "actor": "conductor"
      }
    ];

    return {
      'query': function(params) {
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
        if (params && params.hasOwnProperty('from_state')) {
          var filteredResults = transitions.filter(function(item) {
            return item.from === params.from_state;
          });
          deferred.resolve(filteredResults);
        } else {
          deferred.resolve(transitions);
        }

        return queryResults;
      }
    };
  });
