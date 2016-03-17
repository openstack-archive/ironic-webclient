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
 * Unit tests for the enroll modal controller.
 */
describe('Unit: Ironic-webclient enroll-node modal controller',
  function() {
    'use strict';

    var $controller, $httpBackend;
    var mockInjectionProperties = {
      $scope: {},
      $uibModalInstance: {
        close: function() {
        },
        dismiss: function() {
        }
      }
    };

    beforeEach(function() {
      module('ironic.api.mock.IronicDriver');
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

    describe('Controller Properties', function() {
      it('does not pollute the $scope',
        function() {
          $controller('EnrollModalController', mockInjectionProperties);
          $httpBackend.flush();
          expect(mockInjectionProperties.$scope).toEqual({});
        });

      it('starts without an error object',
        function() {
          var controller = $controller('EnrollModalController', mockInjectionProperties);
          $httpBackend.flush();
          expect(controller.errorMessage).toBeNull();
        });

      it('starts without a node object',
        function() {
          var controller = $controller('EnrollModalController', mockInjectionProperties);
          $httpBackend.flush();
          expect(controller.node).toBeNull();
        });
    });

    describe('Controller Initialization', function() {
      it('should populate the drivers list with a resolving promise',
        function() {
          var controller = $controller('EnrollModalController', mockInjectionProperties);
          expect(controller.drivers).toBeDefined();
          expect(angular.isArray(controller.drivers)).toBeTruthy();
          expect(controller.drivers.$resolved).toBeFalsy();

          $httpBackend.flush();
          expect(controller.drivers.$resolved).toBeTruthy();
          expect(controller.drivers.length).toBe(2);
        });

      it('should report an error message if drivers could not be loaded.',
        function() {
          var errorResponse = {
            error_message: angular.toJson({
              debuginfo: null,
              faultcode: 'Client',
              faultstring: 'Test fault string'
            })
          };

          $httpBackend
            .expectGET('http://ironic.example.com:1000/drivers')
            .respond(400, errorResponse);

          var controller = $controller('EnrollModalController', mockInjectionProperties);
          $httpBackend.flush();

          expect(controller.errorMessage).toBeDefined();
          expect(controller.errorMessage.faultcode).toBe('Client');
          expect(controller.drivers).toBeFalsy();
        });
    });

    describe('loadDriverProperties', function() {
      it('resets all values if a new driver is selected.',
        function() {
          var controller = $controller('EnrollModalController', mockInjectionProperties);
          expect(controller.node).toBeNull();

          controller.loadDriverProperties('test_driver_1');
          $httpBackend.flush();
          var firstNode = controller.node;
          expect(firstNode.driver).toBe('test_driver_1');
          expect(firstNode.name).toBe('');

          controller.loadDriverProperties('test_driver_2');
          $httpBackend.flush();
          var secondNode = controller.node;
          expect(secondNode.driver).toBe('test_driver_2');
          expect(secondNode.name).toBe('');
          expect(firstNode).not.toBe(secondNode);
        });

      it('preserves names between driver loads if one has been entered.',
        function() {
          var controller = $controller('EnrollModalController', mockInjectionProperties);
          expect(controller.node).toBeNull();

          controller.loadDriverProperties('test_driver_1');
          $httpBackend.flush();
          var firstNode = controller.node;
          expect(firstNode.driver).toBe('test_driver_1');
          controller.node.name = 'test';

          controller.loadDriverProperties('test_driver_2');
          $httpBackend.flush();
          var secondNode = controller.node;
          expect(secondNode.driver).toBe('test_driver_2');
          expect(firstNode.name).toBe(secondNode.name);
        });

      it('should display an error invalid driver is selected.',
        function() {
          var controller = $controller('EnrollModalController', mockInjectionProperties);
          expect(controller.driverProperties).toBeNull();

          controller.loadDriverProperties('invalid');
          $httpBackend.flush();

          expect(controller.driverProperties).toBeNull();
          expect(controller.errorMessage.faultcode).toBe('Client');
        });

      it('Retrieves the driver properties from the API when a new driver is selected.',
        inject(function() {

          var controller = $controller('EnrollModalController', mockInjectionProperties);
          expect(controller.driverProperties).toBeNull();

          controller.loadDriverProperties('test_driver_1');
          $httpBackend.flush();

          expect(controller.driverProperties.name).toBe('test_driver_1');

          // Load a new driver
          controller.loadDriverProperties('test_driver_2');
          $httpBackend.flush();

          expect(controller.driverProperties.name).toBe('test_driver_2');
        })
      );
    });

    describe('$scope.close', function() {
      it('calls dismiss when close() is called.',
        function() {
          var spy = spyOn(mockInjectionProperties.$uibModalInstance, 'dismiss');
          var controller = $controller('EnrollModalController', mockInjectionProperties);
          $httpBackend.flush();

          controller.close();
          expect(spy).toHaveBeenCalled();
          expect(spy.calls.count()).toEqual(1);
        });
    });

    describe('$scope.enroll', function() {
      it('resets the error message when called', function() {
        $httpBackend.expectPOST('http://ironic.example.com:1000/nodes').respond(201, '');

        var controller = $controller('EnrollModalController', mockInjectionProperties);
        controller.errorMessage = 'test_message';
        controller.enroll();
        $httpBackend.flush();

        expect(controller.errorMessage).toBeNull();
      });

      it('issues a create request when the enroll() command is called',
        function() {
          var controller = $controller('EnrollModalController', mockInjectionProperties);

          // Load a driver
          controller.loadDriverProperties('test_driver_1');
          $httpBackend.flush();

          // Issue enroll
          $httpBackend.expectPOST('http://ironic.example.com:1000/nodes').respond(201, {});
          controller.enroll();
          $httpBackend.flush();
        });

      it('closes the window on a successful creation.',
        function() {
          var spy = spyOn(mockInjectionProperties.$uibModalInstance, 'close');
          var controller = $controller('EnrollModalController', mockInjectionProperties);

          // Load a driver
          controller.loadDriverProperties('test_driver_1');
          $httpBackend.flush();

          // Issue enroll
          $httpBackend.expectPOST('http://ironic.example.com:1000/nodes').respond(201, {});
          controller.enroll();
          $httpBackend.flush();

          expect(spy.calls.count()).toEqual(1);
        });

      it('Sets the error value when a create fails, but does not close the window.',
        function() {
          var errorResponse = {
            error_message: angular.toJson({
              debuginfo: null,
              faultcode: 'Client',
              faultstring: 'Test fault string'
            })
          };

          var spy = spyOn(mockInjectionProperties.$uibModalInstance, 'close');
          var controller = $controller('EnrollModalController', mockInjectionProperties);

          // Load a driver
          controller.loadDriverProperties('test_driver_1');
          $httpBackend.flush();

          // Issue enroll
          $httpBackend.expectPOST('http://ironic.example.com:1000/nodes')
            .respond(400, errorResponse);
          controller.enroll();
          $httpBackend.flush();

          expect(spy.calls.count()).toEqual(0);
          expect(controller.errorMessage.faultcode).toBe('Client');
        });
    });
  });
