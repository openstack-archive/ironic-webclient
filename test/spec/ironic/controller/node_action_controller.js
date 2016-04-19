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
    });

    describe('remove', function() {
      it('open a modal if called with a node.',
        inject(function($q, $uibModal) {
          var controller = $controller('NodeActionController', mockInjectionProperties);
          var mockNode = {};
          var spy = spyOn($uibModal, 'open').and.callThrough();
          $httpBackend.expectGET('view/ironic/action/remove_node.html').respond(200, '');

          var promise = controller.remove(mockNode);
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

    describe('provisionAction()', function() {
      it('should open an supported modal for known actions',
        inject(function($q, $uibModal) {
          var unknownActions = [
            'manage', 'rebuild', 'delete', 'deploy', 'fail', 'abort', 'clean', 'inspect',
            'provide'
          ];

          var spy = spyOn($uibModal, 'open').and.callThrough();
          $httpBackend.expectGET('view/ironic/action/provision.html').respond(200, '');

          angular.forEach(unknownActions, function(actionName) {
            var testNodeId = 'random_uuid';
            $httpBackend.expectGET('http://ironic.example.com:1000/nodes/random_uuid')
              .respond(200, {uuid: 'random_uuid'});

            var controller = $controller('NodeActionController', mockInjectionProperties);
            controller.provisionAction(actionName, [testNodeId]);

            expect(spy.calls.count()).toBe(1);
            var lastArgs = spy.calls.mostRecent().args[0];
            expect(lastArgs.controller).toBe('ProvisionActionModalController as ctrl');
            spy.calls.reset();
          });
          $httpBackend.flush();
        }));
    });

    describe('powerAction()', function() {

      it('should open a modal',
        inject(function($q, $uibModal) {
          var spy = spyOn($uibModal, 'open').and.callThrough();
          $httpBackend.expectGET('view/ironic/action/unknown.html').respond(200, '');

          var testNode = {power_state: 'power off'};
          var controller = $controller('NodeActionController', mockInjectionProperties);

          controller.powerAction('power on', [testNode]);

          expect(spy.calls.count()).toBe(1);
          var lastArgs = spy.calls.mostRecent().args[0];
          expect(lastArgs.controller).toBe('UnknownActionModalController as ctrl');
          $httpBackend.flush();
        }));

      it('should open an unsupported modal for unknown actions',
        inject(function($q, $uibModal) {
          var unknownActions = [
            'foo', 'bar',

            // The following are not yet implemented.
            'power on', 'power off', 'reboot'
          ];

          var spy = spyOn($uibModal, 'open').and.callThrough();
          $httpBackend.expectGET('view/ironic/action/unknown.html').respond(200, '');

          angular.forEach(unknownActions, function(actionName) {
            var testNode = {power_state: 'power off'};

            var controller = $controller('NodeActionController', mockInjectionProperties);
            controller.powerAction(actionName, [testNode]);

            expect(spy.calls.count()).toBe(1);
            var lastArgs = spy.calls.mostRecent().args[0];
            expect(lastArgs.controller).toBe('UnknownActionModalController as ctrl');
            spy.calls.reset();
          });
          $httpBackend.flush();
        }));
    });
  });
