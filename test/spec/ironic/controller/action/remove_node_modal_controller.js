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
 * Unit tests for the RemoveNodeModalController.
 */
describe('RemoveNodeModalController',
  function() {
    'use strict';

    var $controller, $httpBackend, mockInjectionProperties, $rootScope, $q;

    beforeEach(function() {
      module('ironic.api.mock.IronicNode');
      module('template.mock');
      module('ironic');

      mockInjectionProperties = {
        $scope: {},
        $modalInstance: {
          close: function() {
          },
          dismiss: function() {
          }
        },
        nodes: []
      };
    });

    beforeEach(inject(function(_$controller_, $injector) {
      $httpBackend = $injector.get('$httpBackend');
      $rootScope = $injector.get('$rootScope');
      $q = $injector.get('$q');
      $controller = _$controller_;
    }));

    afterEach(inject(function($$persistentStorage) {
      // Clear any config selections we've made.
      $$persistentStorage.remove('$$selectedConfiguration');

      // Assert no outstanding requests.
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    }));

    describe('Controller Properties', function() {
      it('does not pollute the $scope',
        function() {
          $controller('RemoveNodeModalController', mockInjectionProperties);
          expect(mockInjectionProperties.$scope).toEqual({});
        });

      it('starts not deleting anything',
        function() {
          var controller = $controller('RemoveNodeModalController', mockInjectionProperties);
          expect(controller.deleting).toBeFalsy();
        });

      it('starts not having deleted anything',
        function() {
          var controller = $controller('RemoveNodeModalController', mockInjectionProperties);
          expect(controller.someDeleted).toBeFalsy();
        });

      it('Creates a scope object for each passed node',
        function() {
          mockInjectionProperties.nodes = [{node: 'node1'}, {node: 'node2'}];
          var controller = $controller('RemoveNodeModalController', mockInjectionProperties);

          expect(controller.nodes.length).toBe(2);
          angular.forEach(controller.nodes, function(ctx) {
            expect(ctx.node).toBeDefined();
            expect(ctx.error).toBeNull();
            expect(ctx.state).toBe('present');
          });
        });
    });

    describe('close()', function() {
      it('invokes dismiss() if nothing deleted',
        function() {
          var spyDismiss = spyOn(mockInjectionProperties.$modalInstance, 'dismiss');
          var spyClose = spyOn(mockInjectionProperties.$modalInstance, 'close');

          var controller = $controller('RemoveNodeModalController', mockInjectionProperties);
          controller.someDeleted = false;
          controller.close();

          expect(spyDismiss.calls.count()).toEqual(1);
          expect(spyClose.calls.count()).toEqual(0);
        });

      it('invokes close() if something deleted',
        function() {
          var spyDismiss = spyOn(mockInjectionProperties.$modalInstance, 'dismiss');
          var spyClose = spyOn(mockInjectionProperties.$modalInstance, 'close');

          var controller = $controller('RemoveNodeModalController', mockInjectionProperties);
          controller.someDeleted = true;
          controller.close();

          expect(spyDismiss.calls.count()).toEqual(0);
          expect(spyClose.calls.count()).toEqual(1);
        });
    });

    describe('remove()', function() {

      var mockError = {
        data: {
          error_message: {
            faultstring: "faultstring",
            faultcode: "faultcode"
          }
        }
      };

      function removeMock (success) {
        return function(successHandler, failureHandler) {
          var promise = success ? $q.resolve() : $q.reject(mockError);
          promise.then(successHandler, failureHandler);
          return promise;
        };
      }

      it('deletes nothing if invoked with no nodes.',
        function() {
          var controller = $controller('RemoveNodeModalController', mockInjectionProperties);
          expect(controller.deleting).toBeFalsy();
          expect(controller.someDeleted).toBeFalsy();

          controller.remove();
          $rootScope.$apply(); // Resolve promises
          expect(controller.deleting).toBeFalsy();
          expect(controller.someDeleted).toBeFalsy();
        });

      it('dismisses the modal if invoked with no nodes..',
        function() {
          var spyDismiss = spyOn(mockInjectionProperties.$modalInstance, 'dismiss');
          var controller = $controller('RemoveNodeModalController', mockInjectionProperties);
          expect(controller.deleting).toBeFalsy();
          expect(controller.someDeleted).toBeFalsy();
          controller.remove();
          expect(controller.deleting).toBeTruthy();
          $rootScope.$apply(); // Resolve promises
          expect(controller.deleting).toBeFalsy();
          expect(spyDismiss.calls.count()).toEqual(1);
        });

      it('correctly flips the deleting flag',
        function() {
          var controller = $controller('RemoveNodeModalController', mockInjectionProperties);
          expect(controller.deleting).toBeFalsy();
          controller.remove();
          expect(controller.deleting).toBeTruthy();
          $rootScope.$apply(); // Resolve promises
          expect(controller.deleting).toBeFalsy();
        });

      it('flips the someDeleted flag if some nodes are deleted and others are not',
        function() {
          var spyDismiss = spyOn(mockInjectionProperties.$modalInstance, 'dismiss');
          var spyClose = spyOn(mockInjectionProperties.$modalInstance, 'close');
          mockInjectionProperties.nodes = [
            {$remove: removeMock(true)},
            {$remove: removeMock(false)}
          ];

          var controller = $controller('RemoveNodeModalController', mockInjectionProperties);
          expect(controller.deleting).toBeFalsy();
          expect(controller.someDeleted).toBeFalsy();
          controller.remove();
          expect(controller.nodes[0].state).toBe('removing');
          expect(controller.nodes[1].state).toBe('removing');
          expect(controller.deleting).toBeTruthy();
          $rootScope.$apply();
          expect(controller.deleting).toBeFalsy();
          expect(controller.someDeleted).toBeTruthy();

          expect(controller.nodes[0].state).toBe('removed');
          expect(controller.nodes[1].state).toBe('error');
          expect(spyDismiss.calls.count()).toEqual(0);
          expect(spyClose.calls.count()).toEqual(0);
        });

      it('changes a node\'s context state to "removing" and "removed".',
        function() {
          mockInjectionProperties.nodes = [
            {$remove: removeMock(true)}
          ];

          var controller = $controller('RemoveNodeModalController', mockInjectionProperties);
          expect(controller.deleting).toBeFalsy();
          expect(controller.someDeleted).toBeFalsy();
          controller.remove();
          expect(controller.nodes[0].state).toBe('removing');
          expect(controller.deleting).toBeTruthy();
          $rootScope.$apply();
          expect(controller.deleting).toBeFalsy();
          expect(controller.someDeleted).toBeTruthy();
          expect(controller.nodes[0].state).toBe('removed');
        });

      it('Correctly reports a returned error if a node is not deleted.',
        function() {
          mockInjectionProperties.nodes = [
            {$remove: removeMock(false)}
          ];
          var controller = $controller('RemoveNodeModalController', mockInjectionProperties);
          expect(controller.deleting).toBeFalsy();
          expect(controller.someDeleted).toBeFalsy();
          controller.remove();
          expect(controller.nodes[0].state).toBe('removing');
          expect(controller.deleting).toBeTruthy();
          $rootScope.$apply();
          expect(controller.deleting).toBeFalsy();
          expect(controller.someDeleted).toBeFalsy();
          expect(controller.nodes[0].state).toBe('error');
          expect(controller.nodes[0].error).toBeDefined();
        });

      it('invokes $modalInstance.close() if all nodes have been deleted.',
        function() {
          var spyDismiss = spyOn(mockInjectionProperties.$modalInstance, 'dismiss');
          var spyClose = spyOn(mockInjectionProperties.$modalInstance, 'close');
          mockInjectionProperties.nodes = [
            {$remove: removeMock(true)},
            {$remove: removeMock(true)}
          ];

          var controller = $controller('RemoveNodeModalController', mockInjectionProperties);
          expect(controller.deleting).toBeFalsy();
          expect(controller.someDeleted).toBeFalsy();
          controller.remove();
          expect(controller.nodes[0].state).toBe('removing');
          expect(controller.nodes[1].state).toBe('removing');
          expect(controller.deleting).toBeTruthy();
          $rootScope.$apply();
          expect(controller.deleting).toBeFalsy();
          expect(controller.someDeleted).toBeTruthy();
          expect(controller.nodes[0].state).toBe('removed');
          expect(controller.nodes[1].state).toBe('removed');

          expect(spyDismiss.calls.count()).toEqual(0);
          expect(spyClose.calls.count()).toEqual(1);
        });
    });
  });
