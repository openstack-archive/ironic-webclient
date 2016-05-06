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
 * A generic controller which permits a user to issue power state actions against a list of
 * nodes.
 */
angular.module('ironic').controller('PowerActionModalController',
  function($q, $uibModalInstance, nodeIds, actionName, IronicNode, IronicNodePowerTransition,
           IronicNodePower) {
    'use strict';
    var vm = this;

    vm.someUpdated = false;
    vm.updating = false;
    vm.someNodesExcluded = false;
    vm.actionName = actionName;

    // Setup our nodes.
    vm.nodes = [];
    vm.nodes.$resolved = false;

    // This is the data preloader, which drives all of our modal data setup. This logic will
    // execute in sequence.
    vm.nodes.$promise = $q
      .all({
        nodes: loadNodes(),
        states: loadValidStates()
      })
      .then(filterNodes)
      .then(contextWrap)
      .then(applyNodesToContext)
      .then(toggleExclusionFlag)
      .finally(function() {
        vm.nodes.$resolved = true;
      });

    /**
     * Resolve all states for which the current action is valid.
     *
     * @return {Promise} A promise that resolves with all valid states.
     */
    function loadValidStates () {
      return IronicNodePowerTransition.query().$promise
        .then(function(transitions) {
          return transitions
            .filter(function(transition) {
              return transition.event === actionName;
            })
            .map(function(transition) {
              return transition.from_state;
            });
        });
    }

    /**
     * Resolve the node details for all the passed node ID's.
     *
     * @return {Promise} A promise that resolves with all nodes details.
     */
    function loadNodes () {
      var promises = [];
      angular.forEach(nodeIds, function(nodeId) {
        promises.push(IronicNode.read({uuid: nodeId}).$promise);
      });
      return $q.all(promises);
    }

    /**
     * Filter the nodes into a valid set.
     *
     * @param {{}} results Results from preloading the valid states and valid nodes.
     * @return {[]} A list of nodes that may be manipulated with this action.
     */
    function filterNodes (results) {
      var nodes = results.nodes;
      var states = results.states;

      return nodes.filter(function(node) {
        // Special case here- the fake driver does not update the power state when we move into
        // manage, so we have to check for a null power_state, and provision_state that isn't
        // 'enroll'.
        var powerState = node.power_state;
        if (!powerState && node.provision_state !== 'enroll') {
          powerState = 'power off';
        }
        return states.indexOf(powerState) > -1;
      });
    }

    /**
     * Wrap each node in a context object, used to track state.
     *
     * @param {[]} nodes A list of nodes.
     * @return {[]} A list of context wrapped nodes.
     */
    function contextWrap (nodes) {
      return nodes.map(function(node) {
        return {
          node: node,
          error: null,
          state: 'ready', // ready, busy, error, complete
          changed: false
        };
      });
    }

    /**
     * Apply the nodes to the controller's variables, in a non-destructive fashion.
     *
     * @param {[]} nodes The list of nodes to apply.
     * @return {void}
     */
    function applyNodesToContext (nodes) {
      return angular.forEach(nodes, function(node) {
        vm.nodes.push(node);
        return node;
      });
    }

    /**
     * Toggle the flag on the controller that indicates that some of the selected nodes are not
     * in a valid state for this action.
     *
     * @param {[]} loadedNodes A list of loaded nodes.
     * @return {[]} That same list of loaded nodes, with no modifications.
     */
    function toggleExclusionFlag (loadedNodes) {
      vm.someNodesExcluded = loadedNodes.length !== nodeIds.length;
      return loadedNodes;
    }

    /**
     * Apply the action for which this controller has been configured.
     *
     * @return {void}
     */
    vm.apply = function() {
      vm.updating = true;
      var promises = [];

      // For each context object in our controller...
      angular.forEach(vm.nodes, function(ctx) {
        // Try to issue the request.
        ctx.state = 'updating';

        var state = IronicNodePower.update({
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
          vm.close();
        })
        .finally(function() {
          // Flip the updating bit.
          vm.updating = false;
        });
    };

    /**
     * Close this modal.
     *
     * @return {void}
     */
    vm.close = function() {
      if (vm.someUpdated) {
        // Something was changed, collect the changed nodes and return them.
        var changedNodeIds = [];
        angular.forEach(vm.nodes, function(ctx) {
          if (ctx.changed) {
            changedNodeIds.push(ctx.node.uuid);
          }
        });
        $uibModalInstance.close(changedNodeIds);
      } else {
        // Nothing was changed.
        $uibModalInstance.dismiss();
      }
    };
  });
