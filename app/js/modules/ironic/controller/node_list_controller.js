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
  .controller('NodeListController', function($scope, IronicNode, $uibModal, $log) {
    'use strict';
    var vm = this;

    // Set up controller parameters
    vm.errorMessage = null;
    vm.nodes = [];
    vm.selectedNodes = [];
    vm.selectAll = false;

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
     * Set the power state for the provided node node.
     *
     * @param {IronicNode} node The ironic node to modify.
     * @param {String} stateName The name of the power state.
     * @return {void}
     */
    vm.setPowerState = function(node, stateName) {
      // Do nothing, yet.
      $log.info('Set power state on ' + node.uuid + ' to ' + stateName);
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

    vm.loadNodes();
  });
