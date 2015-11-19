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

    var $controller, $httpBackend;
    var mockInjectionProperties = {
      $scope: {},
      $modal: {
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
          $controller('NodeListController', mockInjectionProperties);
          expect(mockInjectionProperties.$scope).toEqual({});

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

      it('should report an error message if nodes could not be loaded.',
        function() {
          var errorResponse = {
            error_message: angular.toJson({
              'debuginfo': null,
              'faultcode': 'Client',
              'faultstring': 'Test fault string'
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

    describe('$scope.enroll', function() {
      it('should open a modal',
        inject(function($q) {
          var spy = spyOn(mockInjectionProperties.$modal, 'open').and.callFake(function() {
            return {result: $q.resolve({})};
          });
          var controller = $controller('NodeListController', mockInjectionProperties);
          controller.enroll();
          $httpBackend.flush();

          expect(spy.calls.count()).toBe(1);
        }));

      it('should reload the node list if a new node was added.',
        inject(function($q) {
          // Set up a spy.
          var spy = spyOn(mockInjectionProperties.$modal, 'open').and.callFake(function() {
            return {result: $q.resolve({})};
          });

          // Initialize the controller.
          var controller = $controller('NodeListController', mockInjectionProperties);
          $httpBackend.flush();

          // Setup expected calls
          $httpBackend
            .expectGET('http://ironic.example.com:1000/nodes')
            .respond(200, []);

          // Call Enroll
          controller.enroll();
          $httpBackend.flush();

          expect(spy.calls.count()).toBe(1);
        }));
    });
  });
