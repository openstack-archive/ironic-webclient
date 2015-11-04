/*
 * Copyright (c) 2015 Hewlett-Packard Development Company, L.P.
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
 * Node handling for the Ironic UI.
 */
angular.module('ironic')
  .controller('NodeListController', function($scope, IronicNode, $modal) {
    'use strict';
    var vm = this;

    // Load the node list.
    function loadNodes () {
      vm.nodes = IronicNode.query({});
    }

    vm.enroll = function() {
      $modal.open({
        'templateUrl': 'view/ironic/enroll/index.html',
        'controller': 'EnrollModalController as ctrl',
        'backdrop': 'static',
        'resolve': {
          'drivers': function(IronicDriver) {
            return IronicDriver.query({}).$promise;
          }
        }
      }).result.then(
        function(newNode) {
          loadNodes();
        });
    };

    loadNodes();
  });
