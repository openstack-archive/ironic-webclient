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
 * Unit tests for the node action controller.
 */
describe('Unit: Ironic-webclient NodeActionController',
  function() {
    'use strict';

    var $controller, $httpBackend;
    var mockInjectionProperties = {
      $scope: {}
    };

    beforeEach(function() {
      module('ironic.api.mock.IronicNode');
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
          $controller('NodeActionController', mockInjectionProperties);
          expect(mockInjectionProperties.$scope).toEqual({});
        });

      it('starts without an error object',
        function() {
          var controller = $controller('NodeActionController', mockInjectionProperties);

          expect(controller.errorMessage).toBeDefined();
          expect(controller.errorMessage).toBeFalsy();
        });

      it('starts without a node object',
        function() {
          var controller = $controller('NodeActionController', mockInjectionProperties);

          expect(controller.node).toBeDefined();
          expect(controller.node).toBeFalsy();
        });
    });

    describe('Controller Initialization', function() {
      it('should assign the node property via init()',
        function() {
          var controller = $controller('NodeActionController', mockInjectionProperties);

          expect(controller.node).toBeDefined();
          expect(controller.node).toBeFalsy();

          var mockNode = {};
          controller.init(mockNode);
          expect(controller.node).toBeDefined();
          expect(controller.node).toEqual(mockNode);
        });
    });

    describe('remove', function() {
      it('should do nothing if no node is found.',
        function() {
          var controller = $controller('NodeActionController', mockInjectionProperties);

          expect(controller.node).toBeDefined();
          expect(controller.node).toBeFalsy();

          var promise = controller.remove();
          expect(promise.$$state.status).toEqual(2);
        });

      it('open a modal if called with a node.',
        inject(function($q, $uibModal) {
          var controller = $controller('NodeActionController', mockInjectionProperties);
          var mockNode = {};
          var spy = spyOn($uibModal, 'open').and.callThrough();
          $httpBackend.expectGET('view/ironic/action/remove_node.html').respond(200, '');
          controller.init(mockNode);

          var promise = controller.remove();
          expect(promise.$$state.status).toEqual(0); // Unresolved promise.
          expect(spy.calls.count()).toBe(1);

          $httpBackend.flush();
        }));
    });

    describe('$scope.enroll', function() {
      var enrollInjectionProperties = angular.copy(mockInjectionProperties);
      enrollInjectionProperties.$uibModal = {
        open: function() {
        }
      };

      it('should open a modal',
        inject(function($q) {
          var spy = spyOn(enrollInjectionProperties.$uibModal, 'open').and.callFake(function() {
            return {result: $q.resolve({})};
          });
          var controller = $controller('NodeActionController', enrollInjectionProperties);
          controller.enroll();

          expect(spy.calls.count()).toBe(1);
        }));
    });
  });
