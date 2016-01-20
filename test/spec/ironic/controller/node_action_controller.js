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

    var $controller, $httpBackend, $rootScope;
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
      $rootScope = $injector.get('$rootScope');
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

      it('should work with a promise',
        inject(function($q) {
          var controller = $controller('NodeActionController', mockInjectionProperties);
          controller.init($q.resolve({'provision_state': 'enroll'}));
          $rootScope.$apply();

          expect(controller.actions).toBeDefined();
          expect(controller.actions.length).toBe(1);
        }));

      it('should work with a resolved resource',
        inject(function($q) {
          var deferred = $q.defer();
          var testNode = {'provision_state': 'enroll'};
          testNode.$promise = deferred.promise;
          deferred.resolve(testNode);

          var controller = $controller('NodeActionController', mockInjectionProperties);
          controller.init(testNode);
          $rootScope.$apply();

          expect(controller.actions).toBeDefined();
          expect(controller.actions.length).toBe(1);
        }));

      it('should work with an unresolved resource',
        inject(function($q) {
          var testNode = {'provision_state': 'enroll'};
          var deferred = $q.defer();
          testNode.$promise = deferred.promise;

          var controller = $controller('NodeActionController', mockInjectionProperties);
          controller.init(testNode);
          $rootScope.$apply();

          expect(controller.actions).toBeDefined();
          expect(controller.actions.length).toBe(0);

          deferred.resolve(testNode);
          $rootScope.$apply();

          expect(controller.actions).toBeDefined();
          expect(controller.actions.length).toBe(1);
        }));

      describe('Controller Initialization', function() {
        it('should populate the actions property with a blank list',
          function() {
            var controller = $controller('NodeActionController', mockInjectionProperties);
            expect(controller.actions).toBeDefined();
            expect(controller.actions.length).toBe(0);
          });
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
        inject(function($q, $modal) {
          var controller = $controller('NodeActionController', mockInjectionProperties);
          var mockNode = {};
          var spy = spyOn($modal, 'open').and.callThrough();
          $httpBackend.expectGET('view/ironic/action/remove_node.html').respond(200, '');
          controller.init(mockNode);

          var promise = controller.remove();
          expect(promise.$$state.status).toEqual(0); // Unresolved promise.
          expect(spy.calls.count()).toBe(1);

          $httpBackend.flush();
        }));
    });

    describe('performAction()', function() {

      it('should open a modal',
        inject(function($q, $modal) {
          var spy = spyOn($modal, 'open').and.callThrough();
          $httpBackend.expectGET('view/ironic/action/unknown.html').respond(200, '');

          var testNode = {'provision_state': 'enroll'};
          var controller = $controller('NodeActionController', mockInjectionProperties);

          controller.init(testNode);
          controller.performAction('manage');

          expect(spy.calls.count()).toBe(1);
          var lastArgs = spy.calls.mostRecent().args[0];
          expect(lastArgs.controller).toBe('UnknownActionModalController as ctrl');
          $httpBackend.flush();
        }));

      it('should open an unsupported modal for unknown actions',
        inject(function($q, $modal) {
          var unknownActions = [
            'foo', 'bar',

            // The following are not yet implemented.
            'manage', 'rebuild', 'delete', 'deploy', 'fail', 'abort', 'clean', 'inspect', 'provide'
          ];

          var spy = spyOn($modal, 'open').and.callThrough();
          $httpBackend.expectGET('view/ironic/action/unknown.html').respond(200, '');

          angular.forEach(unknownActions, function(actionName) {
            var testNode = {'provision_state': 'enroll'};

            var controller = $controller('NodeActionController', mockInjectionProperties);
            controller.init(testNode);
            controller.performAction(actionName);

            expect(spy.calls.count()).toBe(1);
            var lastArgs = spy.calls.mostRecent().args[0];
            expect(lastArgs.controller).toBe('UnknownActionModalController as ctrl');
            spy.calls.reset();
          });
          $httpBackend.flush();
        }));
    });
  });
