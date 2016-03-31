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
 * Unit tests for the node list controller.
 */
describe('Unit: Ironic-webclient node list controller',
  function() {
    'use strict';

    var $controller, $httpBackend, $rootScope;
    var mockInjectionProperties = {
      $uibModal: {
        open: function() {
        }
      }
    };

    beforeEach(function() {
      module('ironic.api.mock.IronicNode');
      module('ironic.api.mock.IronicDriverProperties');
      module('template.mock');
      module('ironic');
    });

    beforeEach(inject(function(_$controller_, $injector) {
      $httpBackend = $injector.get('$httpBackend');
      $controller = _$controller_;
      $rootScope = $injector.get('$rootScope');

      // Create a new controller scope for every run.
      mockInjectionProperties.$scope = $rootScope.$new();
    }));

    afterEach(inject(function($$persistentStorage) {
      // Clear any config selections we've made.
      $$persistentStorage.remove('$$selectedConfiguration');

      // Assert no outstanding requests.
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();

      // Clear the scope
      mockInjectionProperties.$scope.$destroy();
      mockInjectionProperties.$scope = null;
    }));

    describe('Controller', function() {
      it('does not pollute the $scope',
        function() {
          $controller('NodeListController', mockInjectionProperties);

          var reducedScope = {};
          // Filter out all private variables.
          Object.keys(mockInjectionProperties.$scope).map(function(value) {
            if (value.indexOf('$') === 0) {
              return;
            }
            reducedScope[value] = mockInjectionProperties.$scope[value];
          });

          expect(reducedScope).toEqual({});

          $httpBackend.flush();
        });

      it('starts without an error object',
        function() {
          var controller = $controller('NodeListController', mockInjectionProperties);

          expect(controller.errorMessage).toBeDefined();
          expect(controller.errorMessage).toBeFalsy();

          $httpBackend.flush();
        });
    });

    describe('Controller Initialization', function() {

      it('should populate basic controller values with sensible defaults', function() {
        var controller = $controller('NodeListController', mockInjectionProperties);
        expect(controller.selectAll).toBeFalsy();
        expect(controller.selectedNodes).toEqual([]);
        $httpBackend.flush();
      });

      it('should populate the nodes list with a resolving promise',
        function() {
          var controller = $controller('NodeListController', mockInjectionProperties);
          expect(controller.nodes).toBeDefined();
          expect(angular.isArray(controller.nodes)).toBeTruthy();
          expect(controller.nodes.$resolved).toBeFalsy();

          $httpBackend.flush();
          expect(controller.nodes.$resolved).toBeTruthy();
          expect(controller.nodes.length).toBe(3);
        });

      it('should populate the power transition list with a resolving promise',
        function() {
          var controller = $controller('NodeListController', mockInjectionProperties);
          expect(controller.powerTransitions).toBeDefined();
          expect(angular.isArray(controller.powerTransitions)).toBeTruthy();
          expect(controller.powerTransitions.$resolved).toBeFalsy();

          $httpBackend.flush();
          expect(controller.powerTransitions.$resolved).toBeTruthy();
          expect(controller.powerTransitions.length).toBe(3);
        });

      it('should populate the provision transition list with a resolving promise',
        function() {
          var controller = $controller('NodeListController', mockInjectionProperties);
          expect(controller.provisionTransitions).toBeDefined();
          expect(angular.isArray(controller.provisionTransitions)).toBeTruthy();
          expect(controller.provisionTransitions.$resolved).toBeFalsy();

          $httpBackend.flush();
          expect(controller.provisionTransitions.$resolved).toBeTruthy();
          expect(controller.provisionTransitions.length).toBe(7);
        });

      it('should report an error message if nodes could not be loaded.',
        function() {
          var errorResponse = {
            error_message: angular.toJson({
              debuginfo: null,
              faultcode: 'Client',
              faultstring: 'Test fault string'
            })
          };

          $httpBackend
            .expectGET('http://ironic.example.com:1000/nodes')
            .respond(400, errorResponse);

          var controller = $controller('NodeListController', mockInjectionProperties);
          $httpBackend.flush();

          expect(controller.errorMessage).toBeDefined();
          expect(controller.errorMessage.faultcode).toBe('Client');
          expect(controller.nodes).toBeFalsy();
        });
    });

    describe('init()', function() {

      it('should refresh nodes, power transitions, and provisionTransitions', function() {
        var controller = $controller('NodeListController', mockInjectionProperties);

        $httpBackend.flush();
        expect(controller.nodes.$resolved).toBeTruthy();
        expect(controller.provisionTransitions.$resolved).toBeTruthy();
        expect(controller.powerTransitions.$resolved).toBeTruthy();

        controller.init();
        expect(controller.nodes.$resolved).toBeFalsy();
        expect(controller.provisionTransitions.$resolved).toBeFalsy();
        expect(controller.powerTransitions.$resolved).toBeFalsy();

        $httpBackend.flush();
        expect(controller.nodes.$resolved).toBeTruthy();
        expect(controller.provisionTransitions.$resolved).toBeTruthy();
        expect(controller.powerTransitions.$resolved).toBeTruthy();
      });
    });

    describe('List selection handling', function() {
      var controller;

      beforeEach(function() {
        // Create a clean, initial controller.
        controller = $controller('NodeListController', mockInjectionProperties);
        $httpBackend.flush();
      });

      it('should update selectAll if a user manually selects all nodes',
        function() {
          expect(controller.selectAll).toBeFalsy();
          controller.selectedNodes = angular.copy(controller.nodes);
          mockInjectionProperties.$scope.$digest();
          expect(controller.selectAll).toBeTruthy();
        });

      it('should update selectAll if all nodes are selected and the user unselects a node',
        function() {
          // Select all.
          controller.selectedNodes = angular.copy(controller.nodes);
          mockInjectionProperties.$scope.$digest();
          expect(controller.selectAll).toBeTruthy();

          // Remove one.
          controller.selectedNodes.pop();
          mockInjectionProperties.$scope.$digest();
          expect(controller.selectAll).toBeFalsy();
        });

      it('should select all nodes if selectAll is true',
        function() {
          expect(controller.selectedNodes.length).toBe(0);
          expect(controller.nodes.length).not.toBe(0);
          controller.toggleSelectAll(true);
          expect(controller.selectedNodes.length).toEqual(controller.nodes.length);
        });

      it('should unselect all nodes if selectAll is false',
        function() {
          // Start by selecting everything.
          controller.selectedNodes = angular.copy(controller.nodes);
          mockInjectionProperties.$scope.$digest();
          expect(controller.selectedNodes.length).toEqual(controller.nodes.length);
          expect(controller.selectAll).toBeTruthy();

          // Manually edit selectAll.
          controller.toggleSelectAll(false);
          expect(controller.selectedNodes.length).toBe(0);
        });
    });
  });
