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
 * This module provides some basic IronicPort API responses.
 *
 * Usage: beforeEach(module('ironic.mock.IronicPort'));
 */
angular.module('ironic.api.mock.IronicPort',
  ['ironic.api', 'openstack.mock.$$selectedConfiguration'])
  .run(function($httpBackend) {
    'use strict';

    $httpBackend
      .whenGET('http://ironic.example.com:1000/ports?node=test_node_1')
      .respond(200, {
        ports: []
      });

    $httpBackend
      .whenGET('http://ironic.example.com:1000/ports?node=test_node_2')
      .respond(200, {
        ports: []
      });

    $httpBackend
      .whenGET('http://ironic.example.com:1000/ports?node=test_node_3')
      .respond(200, {
        ports: []
      });
  });
