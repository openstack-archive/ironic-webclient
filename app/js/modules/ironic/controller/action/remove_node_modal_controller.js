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
 * This controller backs the "Remove Node" modal.
 */
angular.module('ironic').controller('RemoveNodeModalController',
  function($uibModalInstance, nodes, $q) {
    'use strict';
    var vm = this;

    // Wrap all the nodes in their own context objects.
    vm.someDeleted = false;
    vm.deleting = false;
    vm.nodes = [];
    angular.forEach(nodes, function(node) {
      vm.nodes.push({
        node: node,
        error: null,
        state: 'present'
      });
    });

    /**
     * Remove all the nodes on this controller.
     *
     * @returns {void}
     */
    vm.remove = function() {
      vm.deleting = true;
      var promises = [];

      // For each context object in our controller...
      angular.forEach(vm.nodes, function(ctx) {
        // Try to delete it.
        ctx.state = 'removing';
        var promise = ctx.node.$remove(
          function() {
            vm.someDeleted = true;
            ctx.state = 'removed';
          },
          function(error) {
            ctx.state = 'error';
            ctx.error = error.data.error_message;
          }
        );
        promises.push(promise);
      });

      // Wait for all the promises...
      $q.all(promises).then(
        function() {
          // If all are successful, just close.
          vm.deleting = false;
          if (vm.someDeleted) {
            $uibModalInstance.close();
          } else {
            $uibModalInstance.dismiss();
          }
        },
        function() {
          // Flip the deleting bit.
          vm.deleting = false;
        });
    };

    /**
     * Close this modal.
     *
     * @returns {void}
     */
    vm.close = function() {
      if (vm.someDeleted) {
        // Something was changed.
        $uibModalInstance.close();
      } else {
        // Nothing was changed.
        $uibModalInstance.dismiss();
      }
    };
  });
