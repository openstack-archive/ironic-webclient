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
  .controller('NodeListController', function($scope, $q, IronicNode, IronicNodeProvisionTransition,
                                             IronicNodePowerTransition) {
    'use strict';
    var vm = this;

    // Set up controller parameters
    vm.errorMessage = null;
    vm.nodes = [];
    vm.selectedNodes = [];
    vm.selectAll = false;
    vm.provisionTransitions = [];
    vm.powerTransitions = [];

    /**
     * Initialize the controller.
     *
     * @returns {void}
     */
    vm.init = function() {
      vm.loadProvisionTransitions();
      vm.loadPowerTransitions();
      vm.loadNodes();
    };

    // Load the node list.
    vm.loadNodes = function() {
      vm.errorMessage = null;
      vm.nodes = IronicNode.query({}, function() {
        vm.selectedNodes = [];
        vm.selectAll = false;
      }, function(error) {
        vm.errorMessage = error.data.error_message;
        vm.selectedNodes = [];
        vm.selectAll = false;
        vm.nodes = null;
      });
    };

    /**
     * Check the selected nodes anytime we suspect that the selectAll property may no longer be
     * valid.
     */
    // using $watchCollection only works on non-scope items if the property provided is a
    // generator. Otherwise this syntax would have to be $scope.$watchCollection('foo'), and
    // we do not permit polluting the scope.
    var unwatchSelectedNodes = $scope.$watchCollection(function() {
      return vm.selectedNodes;
    }, function(newValue) {
      vm.selectAll = newValue.length === vm.nodes.length;
    });
    $scope.$on('$destroy', unwatchSelectedNodes);

    /**
     * Select, or deselect, all nodes based on the value of the checkbox.
     *
     * @param {Boolean} selectAll Whether to select all.
     * @returns {void}
     */
    vm.toggleSelectAll = function(selectAll) {
      if (selectAll) {
        vm.selectedNodes = vm.nodes.map(function(item) {
          return angular.copy(item.uuid);
        });
      } else {
        vm.selectedNodes = [];
      }
    };

    /**
     * Load all valid user power transition names into the controller.
     *
     * @returns {void}
     */
    vm.loadPowerTransitions = function() {
      var transitionPromise = IronicNodePowerTransition.query({actor: 'user'}).$promise;

      vm.powerTransitions = [];
      vm.powerTransitions.$resolved = false;
      vm.powerTransitions.$promise = transitionPromise
        .then(mapTransitionNames)
        .then(function(names) {
          angular.forEach(names, function(name) {
            vm.powerTransitions.push(name);
          });
          vm.powerTransitions.$resolved = true;
        });
    };

    /**
     * Load all valid user provisioning transitions names into the controller.
     *
     * @returns {void}
     */
    vm.loadProvisionTransitions = function() {
      var transitionPromise = IronicNodeProvisionTransition.query({actor: 'user'}).$promise;

      vm.provisionTransitions = [];
      vm.provisionTransitions.$resolved = false;
      vm.provisionTransitions.$promise = transitionPromise
        .then(mapTransitionNames)
        .then(function(names) {
          angular.forEach(names, function(name) {
            vm.provisionTransitions.push(name);
          });
          vm.provisionTransitions.$resolved = true;
        });
    };

    /**
     * This helper method reduces the transition data format down to the actual action name that
     * can be performed on a node.
     *
     * @param {[{}]} transitions The list of resolved transitions.
     * @returns {Array} The reduced list of available transitions.
     */
    function mapTransitionNames (transitions) {
      var reducedTransitions = [];
      transitions = transitions.map(function(item) {
        return item.event;
      });
      // deduplicate.

      angular.forEach(transitions, function(name) {
        if (reducedTransitions.indexOf(name) === -1) {
          reducedTransitions.push(name);
        }
      });
      return reducedTransitions;
    }

    vm.init();
  });
