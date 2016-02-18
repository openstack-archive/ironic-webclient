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
 * This controller handles the enrollment of a new, single, node
 */
angular.module('ironic').controller('EnrollModalController',
  function($scope, $modalInstance, IronicDriver, IronicDriverProperties,
           IronicNode) {
    'use strict';
    var vm = this;

    vm.drivers = null;
    vm.errorMessage = null;
    vm.driverProperties = null;
    vm.node = null;

    vm.loadDrivers = function() {
      vm.errorMessage = null;
      vm.drivers = IronicDriver.query({}, function() {
        // Do nothing on success.
      }, function(error) {
        vm.errorMessage = error.data.error_message;
        vm.drivers = null;
      });
    };

    // Given a driver name, retrieve all the driver's options.
    vm.loadDriverProperties = function(driverName) {
      vm.driverProperties = null;
      vm.errorMessage = null;
      vm.node = {
        name: vm.node ? vm.node.name : '', // Preserve previously entered names.
        driver: driverName,
        driver_info: {}
      };

      var params = {
        'driver_name': driverName
      };

      IronicDriverProperties.read(params).$promise.then(
        function(properties) {
          vm.driverProperties = properties;
        },
        function(error) {
          vm.errorMessage = error.data.error_message;
        });
    };

    vm.enroll = function() {
      vm.errorMessage = null;
      IronicNode.create(vm.node,
        function(node) {
          $modalInstance.close(node);
        },
        function(error) {
          vm.errorMessage = error.data.error_message;
        }
      );
    };

    vm.close = function() {
      $modalInstance.dismiss();
    };

    // Initialize the drivers.
    vm.loadDrivers();
  });
