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
 * This controller allows the creation of a new configuration.
 */
angular.module('ironic').controller('ConfigurationAddController',
  function($scope, $state, $location, $$defaultConfiguration,
           $$configuration, $modalInstance, configuration) {
    'use strict';
    var vm = this;

    vm.configuration = configuration;
    vm.newConfiguration = angular.copy($$defaultConfiguration);

    vm.location = {
      'host': $location.host(),
      'protocol': $location.protocol(),
      'port': $location.port()
    };

    vm.save = function() {
      vm.newConfiguration.id = vm.newConfiguration.name;
      $modalInstance.close(vm.newConfiguration);
    };

    vm.close = function() {
      $modalInstance.dismiss();
    };
  });
