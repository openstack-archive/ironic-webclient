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
 * This controller allows the management of all the cloud configuration entries.
 */
angular.module('ironic').controller('ConfigurationController',
  function($state, $location, $$configuration, $$selectedConfiguration, $modal) {
    'use strict';
    var vm = this;

    vm.configurations = [];

    vm.location = {
      'host': $location.host(),
      'protocol': $location.protocol(),
      'port': $location.port()
    };

    function reloadConfigurations () {
      vm.configurations = $$configuration.query({});
    }

    /**
     * Select a single configuration for the current application runtime.
     *
     * @param configuration The configuration to select.
     */
    vm.select = function(configuration) {
      $$selectedConfiguration.set(configuration).$promise.then(
        function() {
          $state.go('root.ironic');
        }
      );
    };

    /**
     * Displays the local configuration add modal.
     */
    vm.add = function() {
      //  var deferred = $q.defer();
      $modal.open({
        'templateUrl': 'view/ironic/config_add.html',
        'controller': 'ConfigurationAddController as ctrl',
        'backdrop': 'static',
        'resolve': {
          'configuration': function() {
            return $$configuration.query({}).$promise;
          }
        }
      }).result.then(
        function(newConfig) {
          $$configuration.create(newConfig).$promise.then(reloadConfigurations);
        });
    };

    vm.remove = function(config) {
      config.$remove().$promise.then(reloadConfigurations);
    };

    reloadConfigurations();
  });