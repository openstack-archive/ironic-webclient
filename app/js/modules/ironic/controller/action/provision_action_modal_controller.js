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
 * A generic controller which permits a user to issue provision state actions against a list of
 * nodes.
 */
angular.module('ironic').controller('ProvisionActionModalController',
  function($modalInstance, nodes, actionName, $q, IronicNodeProvision) {
    'use strict';
    var vm = this;

    vm.someUpdated = false;
    vm.updating = false;
    vm.actionName = actionName;

    // Wrap all the nodes in their own context objects.
    vm.nodes = [];
    angular.forEach(nodes, function(node) {
      vm.nodes.push({
        node: node,
        error: null,
        state: 'ready', // ready, busy, error, complete
        changed: false
      });
    });

    /**
     * Apply the action for which this controller has been configured.
     *
     * @returns {void}
     */
    vm.apply = function() {
      vm.updating = true;
      var promises = [];

      // For each context object in our controller...
      angular.forEach(vm.nodes, function(ctx) {
        // Try to issue the request.
        ctx.state = 'updating';

        var state = IronicNodeProvision.update({
          node_ident: ctx.node.uuid,
          target: actionName
        }, function() {
          vm.someUpdated = true;
          ctx.changed = true;
          ctx.state = 'complete';
        }, function(error) {
          ctx.state = 'error';
          ctx.error = error.data.error_message;
        });

        promises.push(state.$promise);
      });

      // Wait for all the promises...
      $q.all(promises).then(
        function() {
          // If all are successful, just close.
          vm.updating = false;
          vm.close();
        },
        function() {
          // Flip the updating bit.
          vm.updating = false;
        });
    };

    /**
     * Close this modal.
     *
     * @returns {void}
     */
    vm.close = function() {
      if (vm.someUpdated) {
        // Something was changed, collect the changed nodes and return them.
        var changedNodes = [];
        angular.forEach(vm.nodes, function(ctx) {
          if (ctx.changed) {
            changedNodes.push(ctx.node);
          }
        });
        $modalInstance.close(changedNodes);
      } else {
        // Nothing was changed.
        $modalInstance.dismiss();
      }
    };
  });
