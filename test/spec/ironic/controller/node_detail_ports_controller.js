/*
 * Copyright (c) 2015 Hewlett-Packard Development Company, L.P.
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
 * Unit tests for the node detail ports controller.
 */
describe('Unit: NodeDetailPortsController',
  function() {
    'use strict';

    var $controller, $httpBackend;
    var mockInjectionProperties = {
      $scope: {},
      nodeUuid: 'test_node_1'
    };

    beforeEach(function() {
      module('ironic.api.mock.IronicPort');
      module('template.mock');
      module('ironic');
    });

    beforeEach(inject(function(_$controller_, $injector) {
      $httpBackend = $injector.get('$httpBackend');
      $controller = _$controller_;
    }));

    afterEach(inject(function($$persistentStorage) {
      // Clear any config selections we've made.
      $$persistentStorage.remove('$$selectedConfiguration');

      // Assert no outstanding requests.
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    }));

    describe('Controller', function() {
      it('does not pollute the $scope',
        function() {
          $controller('NodeDetailPortsController', mockInjectionProperties);
          expect(mockInjectionProperties.$scope).toEqual({});

          // Cleanup
          $httpBackend.flush();
        });
    });

    describe('Controller Initialization', function() {
      it('should populate the ports property with a resolving promise',
        function() {
          var controller = $controller('NodeDetailPortsController', mockInjectionProperties);
          expect(controller.ports).toBeDefined();
          expect(angular.isArray(controller.ports)).toBeTruthy();
          expect(controller.ports.length).toBe(0);
          expect(controller.ports.$resolved).toBeFalsy();

          $httpBackend.flush();
          expect(controller.ports.$resolved).toBeTruthy();
          expect(controller.ports.length).toBe(0);
        });

      it('should report an error message if ports could not be loaded.',
        function() {
          var errorResponse = {
            error_message: angular.toJson({
              debuginfo: null,
              faultcode: 'Client',
              faultstring: 'Test fault string'
            })
          };

          $httpBackend
            .expectGET('http://ironic.example.com:1000/ports?node=test_node_1')
            .respond(400, errorResponse);

          var controller = $controller('NodeDetailPortsController', mockInjectionProperties);
          $httpBackend.flush();

          expect(controller.errorMessage).toBeDefined();
          expect(controller.errorMessage.faultcode).toBe('Client');
          expect(controller.ports).toBeNull();
        });
    });
  });
