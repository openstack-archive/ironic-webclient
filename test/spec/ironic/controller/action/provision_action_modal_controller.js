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
 * Unit tests for the provision action modal controller.
 */
describe('ProvisionActionModalController',
  function() {
    'use strict';

    var $controller, $httpBackend, mockInjectionProperties, $rootScope;

    beforeEach(function() {
      module('ironic.api.mock.IronicNode');
      module('template.mock');
      module('ironic');
    });

    beforeEach(inject(function(_$controller_, $injector) {
      $httpBackend = $injector.get('$httpBackend');
      $rootScope = $injector.get('$rootScope');
      $controller = _$controller_;

      mockInjectionProperties = {
        $scope: {},
        $modalInstance: {
          close: function() {
          },
          dismiss: function() {
          }
        },
        actionName: 'test',
        nodes: [{'uuid': 'test_node_1'}, {'uuid': 'test_node_2'}]
      };
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
          $controller('ProvisionActionModalController', mockInjectionProperties);
          expect(mockInjectionProperties.$scope).toEqual({});
        });

      it('starts with the updating flag disabled',
        function() {
          var controller = $controller('ProvisionActionModalController', mockInjectionProperties);
          expect(controller.updating).toBeFalsy();
        });

      it('starts with the someUpdated flag disabled',
        function() {
          var controller = $controller('ProvisionActionModalController', mockInjectionProperties);
          expect(controller.someUpdated).toBeFalsy();
        });
    });

    describe('Controller Initialization', function() {
      it('passes the actionName to the controller scope',
        function() {
          var controller = $controller('ProvisionActionModalController', mockInjectionProperties);
          expect(controller.actionName).toEqual('test');
        });

      it('Creates a context object for each passed node',
        function() {
          var controller = $controller('ProvisionActionModalController', mockInjectionProperties);

          expect(controller.nodes.length).toBe(2);
          angular.forEach(controller.nodes, function(ctx) {
            expect(ctx.node).toBeDefined();
            expect(ctx.error).toBeNull();
            expect(ctx.changed).toBe(false);
            expect(ctx.state).toBe('ready');
          });
        });
    });

    describe('close()', function() {
      it('invokes dismiss() if nothing updated',
        function() {
          var spyDismiss = spyOn(mockInjectionProperties.$modalInstance, 'dismiss');
          var spyClose = spyOn(mockInjectionProperties.$modalInstance, 'close');

          var controller = $controller('ProvisionActionModalController', mockInjectionProperties);
          controller.someUpdated = false;
          controller.close();

          expect(spyDismiss.calls.count()).toEqual(1);
          expect(spyClose.calls.count()).toEqual(0);
        });

      it('invokes close() with updated nodes if something updated',
        function() {
          var spyDismiss = spyOn(mockInjectionProperties.$modalInstance, 'dismiss');
          var spyClose = spyOn(mockInjectionProperties.$modalInstance, 'close');

          var controller = $controller('ProvisionActionModalController', mockInjectionProperties);
          controller.someUpdated = true;
          controller.nodes[0].state = 'complete';
          controller.nodes[0].changed = true;
          controller.close();

          expect(spyDismiss.calls.count()).toEqual(0);
          expect(spyClose.calls.count()).toEqual(1);
          expect(spyClose.calls.mostRecent().args[0]).toEqual([controller.nodes[0].node]);
        });
    });

    describe('apply()', function() {

      var mockError = {
        error_message: {
          faultstring: "faultstring",
          faultcode: "faultcode"
        }
      };

      it('modifies nothing if invoked with no nodes.',
        function() {
          mockInjectionProperties.nodes = [];
          var controller = $controller('ProvisionActionModalController', mockInjectionProperties);
          expect(controller.updating).toBeFalsy();
          expect(controller.someUpdated).toBeFalsy();

          controller.apply();
          $rootScope.$apply(); // Resolve promises
          expect(controller.updating).toBeFalsy();
          expect(controller.someUpdated).toBeFalsy();
        });

      it('dismisses the modal if invoked with no nodes.',
        function() {
          var spyDismiss = spyOn(mockInjectionProperties.$modalInstance, 'dismiss');
          mockInjectionProperties.nodes = [];

          var controller = $controller('ProvisionActionModalController', mockInjectionProperties);
          expect(controller.updating).toBeFalsy();
          expect(controller.someUpdated).toBeFalsy();
          controller.apply();
          expect(controller.updating).toBeTruthy();
          $rootScope.$apply();
          expect(controller.updating).toBeFalsy();
          expect(spyDismiss.calls.count()).toEqual(1);
        });

      it('correctly flips the updating flag',
        function() {
          var controller = $controller('ProvisionActionModalController', mockInjectionProperties);
          $httpBackend
            .expectPUT('http://ironic.example.com:1000/nodes/test_node_1/states/provision')
            .respond(202);
          $httpBackend
            .expectPUT('http://ironic.example.com:1000/nodes/test_node_2/states/provision')
            .respond(202);
          expect(controller.updating).toBeFalsy();
          controller.apply();
          expect(controller.updating).toBeTruthy();
          $httpBackend.flush();
          expect(controller.updating).toBeFalsy();
        });

      it('flips the someUpdated flag if some nodes are updated and others are not',
        function() {
          var spyDismiss = spyOn(mockInjectionProperties.$modalInstance, 'dismiss');
          var spyClose = spyOn(mockInjectionProperties.$modalInstance, 'close');
          $httpBackend
            .expectPUT('http://ironic.example.com:1000/nodes/test_node_1/states/provision')
            .respond(400, {});
          $httpBackend
            .expectPUT('http://ironic.example.com:1000/nodes/test_node_2/states/provision')
            .respond(202);

          var controller = $controller('ProvisionActionModalController', mockInjectionProperties);
          expect(controller.updating).toBeFalsy();
          expect(controller.someUpdated).toBeFalsy();
          controller.apply();
          expect(controller.nodes[0].state).toBe('updating');
          expect(controller.nodes[1].state).toBe('updating');
          expect(controller.updating).toBeTruthy();
          $httpBackend.flush();
          expect(controller.updating).toBeFalsy();
          expect(controller.someUpdated).toBeTruthy();

          expect(controller.nodes[0].state).toBe('error');
          expect(controller.nodes[1].state).toBe('complete');
          expect(spyDismiss.calls.count()).toEqual(0);
          expect(spyClose.calls.count()).toEqual(0);
        });

      it('changes a node\'s context state to "updating" and "complete".',
        function() {
          $httpBackend
            .expectPUT('http://ironic.example.com:1000/nodes/test_node_1/states/provision')
            .respond(202);
          $httpBackend
            .expectPUT('http://ironic.example.com:1000/nodes/test_node_2/states/provision')
            .respond(202);

          var controller = $controller('ProvisionActionModalController', mockInjectionProperties);
          expect(controller.updating).toBeFalsy();
          expect(controller.someUpdated).toBeFalsy();
          controller.apply();
          expect(controller.nodes[0].state).toBe('updating');
          expect(controller.nodes[1].state).toBe('updating');
          expect(controller.updating).toBeTruthy();
          $httpBackend.flush();
          expect(controller.updating).toBeFalsy();
          expect(controller.someUpdated).toBeTruthy();
          expect(controller.nodes[0].state).toBe('complete');
          expect(controller.nodes[1].state).toBe('complete');
        });

      it('Correctly reports a returned error if a request fails.',
        function() {
          $httpBackend
            .expectPUT('http://ironic.example.com:1000/nodes/test_node_1/states/provision')
            .respond(400, mockError);
          $httpBackend
            .expectPUT('http://ironic.example.com:1000/nodes/test_node_2/states/provision')
            .respond(400, mockError);

          var controller = $controller('ProvisionActionModalController', mockInjectionProperties);
          expect(controller.updating).toBeFalsy();
          expect(controller.someUpdated).toBeFalsy();
          controller.apply();
          expect(controller.nodes[0].state).toBe('updating');
          expect(controller.nodes[1].state).toBe('updating');
          expect(controller.updating).toBeTruthy();
          $httpBackend.flush();
          expect(controller.updating).toBeFalsy();
          expect(controller.someUpdated).toBeFalsy();
          expect(controller.nodes[0].state).toBe('error');
          expect(controller.nodes[0].error).toBeDefined();
          expect(controller.nodes[1].state).toBe('error');
          expect(controller.nodes[1].error).toBeDefined();
        });

      it('invokes $modalInstance.close() if all nodes have been updated.',
        function() {
          var spyDismiss = spyOn(mockInjectionProperties.$modalInstance, 'dismiss');
          var spyClose = spyOn(mockInjectionProperties.$modalInstance, 'close');
          $httpBackend
            .expectPUT('http://ironic.example.com:1000/nodes/test_node_1/states/provision')
            .respond(202);
          $httpBackend
            .expectPUT('http://ironic.example.com:1000/nodes/test_node_2/states/provision')
            .respond(202);

          var controller = $controller('ProvisionActionModalController', mockInjectionProperties);
          expect(controller.updating).toBeFalsy();
          expect(controller.someUpdated).toBeFalsy();
          controller.apply();
          expect(controller.nodes[0].state).toBe('updating');
          expect(controller.nodes[1].state).toBe('updating');
          expect(controller.updating).toBeTruthy();
          $httpBackend.flush();
          expect(controller.updating).toBeFalsy();
          expect(controller.someUpdated).toBeTruthy();
          expect(controller.nodes[0].state).toBe('complete');
          expect(controller.nodes[1].state).toBe('complete');

          expect(spyDismiss.calls.count()).toEqual(0);
          expect(spyClose.calls.count()).toEqual(1);
          expect(spyClose.calls.mostRecent().args[0][0]).toEqual(controller.nodes[0].node);
          expect(spyClose.calls.mostRecent().args[0][1]).toEqual(controller.nodes[1].node);
        });
    });
  });
