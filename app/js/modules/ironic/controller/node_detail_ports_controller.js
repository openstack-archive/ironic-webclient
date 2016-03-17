/*
 * Copyright (c) 2015 Hewlett Packard Enterprise Development Company, L.P.
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
 * Node port handling for the Ironic UI.
 */
angular.module('ironic').controller('NodeDetailPortsController',
  function(nodeUuid, IronicPort) {
    'use strict';
    var vm = this;

    // Set up controller parameters
    vm.errorMessage = null;
    vm.ports = null;

    // Load the node.
    vm.ports = IronicPort.query({
      node: nodeUuid
    }, angular.noop, function(error) {
      // Set the error message and clear the node promise.
      vm.errorMessage = error.data.error_message;
      vm.ports = null;
    });
  });
