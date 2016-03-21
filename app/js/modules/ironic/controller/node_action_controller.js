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
  function($uibModal, $q) {
    'use strict';

    var vm = this;

    // Set up controller parameters
    vm.errorMessage = null;
    vm.node = null;

    /**
     * Initialize this controller with a specific node.
     *
     * @param {IronicNode} node The node to initialize this controller with.
     * @return {void}
     */
    vm.init = function(node) {
      vm.node = node;
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
      return $uibModal.open({
        templateUrl: 'view/ironic/action/remove_node.html',
        controller: 'RemoveNodeModalController as ctrl',
        backdrop: 'static',
        resolve: {
          nodes: function() {
            return [vm.node];
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
