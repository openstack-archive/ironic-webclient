/*
 * Copyright (c) 2015 Hewlett-Packard Enterprise Development Company, L.P.
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
 * This module provides some basic IronicNode API responses.
 *
 * Usage: beforeEach(module('ironic.mock.IronicNode'));
 */
angular.module('ironic.api.mock.IronicNode',
  ['ironic.api', 'openstack.mock.$$selectedConfiguration'])
  .run(function($httpBackend) {
    'use strict';

    var nodes = [
      {
        uuid: 'test_node_1',
        driver: 'test_driver_1',
        provision_state: 'enroll',
        power_state: null
      },
      {
        uuid: 'test_node_2',
        driver: 'test_driver_1',
        provision_state: 'enroll',
        power_state: null
      },
      {
        uuid: 'test_node_3',
        driver: 'test_driver_2',
        provision_state: 'manageable',
        power_state: 'power off'
      },
      {
        uuid: 'test_node_4',
        driver: 'test_driver_2',
        provision_state: 'manageable',
        power_state: 'power off'
      },
      {
        uuid: 'test_node_5',
        driver: 'test_driver_2',
        provision_state: 'active',
        power_state: 'power on'
      }
    ];

    $httpBackend
      .whenGET('http://ironic.example.com:1000/nodes')
      .respond(200, {
        nodes: angular.copy(nodes)
      });

    $httpBackend
      .whenGET('http://ironic.example.com:1000/nodes/test_node_1')
      .respond(200, angular.copy(nodes[0]));

    $httpBackend
      .whenGET('http://ironic.example.com:1000/nodes/test_node_2')
      .respond(200, angular.copy(nodes[1]));

    $httpBackend
      .whenGET('http://ironic.example.com:1000/nodes/test_node_3')
      .respond(200, angular.copy(nodes[2]));

    $httpBackend
      .whenGET('http://ironic.example.com:1000/nodes/test_node_4')
      .respond(200, angular.copy(nodes[3]));

    $httpBackend
      .whenGET('http://ironic.example.com:1000/nodes/test_node_5')
      .respond(200, angular.copy(nodes[4]));
  });
