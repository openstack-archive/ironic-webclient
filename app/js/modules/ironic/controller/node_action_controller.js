/*
 * Copyright (c) 2016 Hewlett Packard Enterprise Development Company, L.P.
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
 * Controller which handles manipulation of individual nodes.
 */
angular.module('ironic').controller('NodeActionController',
  function($modal, $q, IronicNodeTransition) {
    'use strict';

    var vm = this;

    // Set up controller parameters
    vm.errorMessage = null;
    vm.node = null;

    /**
     * List of valid actions for this node.
     *
     * @type {Array}
     */
    vm.actions = [];

    /**
     * Initialize this controller with a specific node.
     *
     * @param {IronicNode} node The node to initialize this controller with.
     * @return {void}
     */
    vm.init = function(node) {
      vm.node = node;
      vm.loadValidActions();
    };

    /**
     * Load the valid actions for this node's state.
     *
     * @return {void}
     */
    vm.loadValidActions = function() {
      var promise = $q.resolve(vm.node.$promise || vm.node);
      // Assume this is a resource.
      promise.then(function(resolvedNode) {
        IronicNodeTransition.query({
          from_state: resolvedNode.provision_state,
          actor: 'user'
        }, function(results) {
          vm.actions = results;
        });
      });
    };

    /**
     * Delete the node in this controller.
     *
     * @return {Promise} A promise that will resolve true if the modal closed with some deletions.
     */
    vm.remove = function() {
      if (vm.node === null) {
        // init() not called, or called with invalid value.
        return $q.reject();
      }

      // Return the result of the modal.
      return $modal.open({
        'templateUrl': 'view/ironic/action/remove_node.html',
        'controller': 'RemoveNodeModalController as ctrl',
        'backdrop': 'static',
        'resolve': {
          nodes: function() {
            return [vm.node];
          }
        }
      }).result;
    };

    /**
     * Attempt to perform the given action on the provided node.
     *
     * @param {String} actionName The name of the action.
     * @returns {void}
     */
    vm.performAction = function(actionName) {
      var modalParams = {
        'templateUrl': 'view/ironic/action/unknown.html',
        'controller': 'ProvisionActionModalController as ctrl',
        'resolve': {
          'actionName': function() {
            return actionName;
          },
          'nodes': function() {
            return [vm.node];
          }
        }
      };

      switch (actionName) {
        case 'manage':
          modalParams.templateUrl = 'view/ironic/action/manage_node.html';
          break;
        case 'rebuild':
        case 'delete':
        case 'deploy':
        case 'fail':
        case 'abort':
        case 'clean':
        case 'inspect':
        case 'provide':
        // None of these actions are implemented yet; they are left here as a checklist.
      }

      $modal.open(modalParams).result.then(function() {
        vm.node.$get().then(vm.loadValidActions);
      });
    };
  });
