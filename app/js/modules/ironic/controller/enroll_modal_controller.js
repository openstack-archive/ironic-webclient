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
  function ($scope, $modalInstance, drivers, IronicDriverProperties,
            IronicNode) {
    'use strict';
    var vm = this;

    vm.drivers = drivers;
    vm.error_message = null;

    // Given a driver name, retrieve all the driver's options.
    vm.loadDriverProperties = function (driverName) {
      vm.node = {
        driver: driverName,
        driver_info: {}
      };
      vm.driverProperties = IronicDriverProperties.read({
        'driver_name': driverName
      });
    };

    vm.enroll = function () {
      vm.error_message = null;
      IronicNode.create(vm.node).$promise.then(
        function (node) {
          $modalInstance.close(node);
        },
        function (error) {
          vm.error_message = error.data.faultstring;
        }
      );
    };

    vm.close = function () {
      $modalInstance.dismiss();
    };
  });
