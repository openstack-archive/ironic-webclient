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
 * Unit tests for the driver list controller.
 */
describe('Unit: Ironic-webclient driver list controller',
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
      module('ironic.api.mock.IronicDriver');
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
          $controller('DriverListController', mockInjectionProperties);

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
          var controller = $controller('DriverListController', mockInjectionProperties);

          expect(controller.errorMessage).toBeDefined();
          expect(controller.errorMessage).toBeFalsy();

          $httpBackend.flush();
        });
    });

    describe('Controller Initialization', function() {

      it('should populate basic controller values with sensible defaults', function() {
        var controller = $controller('DriverListController', mockInjectionProperties);
        expect(controller.errorMessage).toBeNull();
        $httpBackend.flush();
      });

      it('should populate the drivers list with a resolving promise',
        function() {
          var controller = $controller('DriverListController', mockInjectionProperties);
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

          var controller = $controller('DriverListController', mockInjectionProperties);
          $httpBackend.flush();

          expect(controller.errorMessage).toBeDefined();
          expect(controller.errorMessage.faultcode).toBe('Client');
          expect(controller.drivers).toBeFalsy();
        });
    });

    describe('init()', function() {

      it('should refresh drivers', function() {
        var controller = $controller('DriverListController', mockInjectionProperties);

        $httpBackend.flush();
        expect(controller.drivers.$resolved).toBeTruthy();

        controller.init();
        expect(controller.drivers.$resolved).toBeFalsy();

        $httpBackend.flush();
        expect(controller.drivers.$resolved).toBeTruthy();
      });
    });
  });
