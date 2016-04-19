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
  function($uibModal) {
    'use strict';

    var vm = this;

    // Set up controller parameters
    vm.errorMessage = null;

    /**
     * Generic unknown action handler, here as a placeholder until we get actual actions built out.
     *
     * @param {String} actionName The name of the action to perform.
     * @param {[{}]} nodes An array of nodes on which to perform this action.
     * @returns {Promise} A promise that resolves when the user performs the action.
     */
    function unknownActionHandler (actionName, nodes) {
      return $uibModal.open({
        templateUrl: 'view/ironic/action/unknown.html',
        controller: 'UnknownActionModalController as ctrl',
        resolve: {
          actionName: function() {
            return actionName;
          },
          nodes: function() {
            return nodes;
          }
        }
      }).result;
    }

    vm.powerAction = unknownActionHandler;

    /**
     * Provision action handler, delegates the provision action to the modal controller.
     *
     * @param {String} actionName The name of the action to perform.
     * @param {[{}]} nodes An array of nodes on which to perform this action.
     * @returns {Promise} A promise that resolves when the user performs the action.
     */
    vm.provisionAction = function provisionActionHandler (actionName, nodes) {
      var modalParams = {
        templateUrl: 'view/ironic/action/provision.html',
        controller: 'ProvisionActionModalController as ctrl',
        resolve: {
          actionName: function() {
            return actionName;
          },
          nodeIds: function() {
            return nodes;
          }
        }
      };

      switch (actionName) {
        case 'manage':
        case 'rebuild':
        case 'delete':
        case 'deploy':
        case 'fail':
        case 'abort':
        case 'clean':
        case 'inspect':
        case 'provide':
        default:
          modalParams.templateUrl = 'view/ironic/action/provision.html';
      }

      return $uibModal.open(modalParams).result;
    };

    /**
     * Delete the node in this controller.
     *
     * @param {IronicNode} node The node instance to remove.
     * @return {Promise} A promise that will resolve true if the modal closed with some deletions.
     */
    vm.remove = function(node) {

      // Return the result of the modal.
      return $uibModal.open({
        templateUrl: 'view/ironic/action/remove_node.html',
        controller: 'RemoveNodeModalController as ctrl',
        backdrop: 'static',
        resolve: {
          nodes: function() {
            return [node];
          }
        }
      }).result;
    };

    /**
     * Enroll a new node.
     *
     * @return {Promise} A promise that will resolve true if a node has been added.
     */
    vm.enroll = function() {
      return $uibModal.open({
        templateUrl: 'view/ironic/enroll/index.html',
        controller: 'EnrollModalController as ctrl',
        backdrop: 'static'
      }).result;
    };
  });
