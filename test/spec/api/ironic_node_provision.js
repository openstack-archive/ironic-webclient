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
 * Unit tests for Ironic's IronicNodeProvision resource.
 */
describe('IronicNodeProvision',
  function() {
    'use strict';

    var $rootScope, $httpBackend;

    // Load common configuration mocks.
    beforeEach(module('openstack.mock.$$configuration'));

    // We are testing the ironic.api module.
    beforeEach(module('ironic.api'));

    beforeEach(inject(function($injector) {
      // Set up the mock http service
      $rootScope = $injector.get('$rootScope');
      $httpBackend = $injector.get('$httpBackend');
    }));

    afterEach(inject(function($$persistentStorage) {
      // Clear any config selections we've made.
      $$persistentStorage.remove('$$selectedConfiguration');

      // Assert no outstanding requests.
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    }));

    describe('Interface', function() {
      it('should implement the update method',
        inject(function(IronicNodeProvision) {
          expect(IronicNodeProvision.update).toBeDefined();
        })
      );

      it('should not implement the query, create, read, or remove method',
        inject(function(IronicNodeProvision) {
          expect(IronicNodeProvision.query).not.toBeDefined();
          expect(IronicNodeProvision.create).not.toBeDefined();
          expect(IronicNodeProvision.read).not.toBeDefined();
          expect(IronicNodeProvision.remove).not.toBeDefined();
        })
      );
    });

    describe('basic behavior', function() {

      var testManageBody = {
        node_ident: 'test_id',
        target: 'manage'
      };

      it('should switch API requests if the configuration changes.',
        inject(function(IronicNodeProvision, $$selectedConfiguration) {

          // Select #1
          var config1 = $$selectedConfiguration.set('test_config_1');
          $rootScope.$apply();
          expect(config1.ironic.apiRoot).toBe('http://ironic.example.com:1000');

          // Try a request
          $httpBackend.expectPUT('http://ironic.example.com:1000/nodes/test_id/states/provision')
            .respond(202);
          var result1 = IronicNodeProvision.update(testManageBody);
          expect(result1.$promise).toBeDefined();
          expect(result1.$resolved).toBeFalsy();
          $httpBackend.flush();
          expect(result1.$resolved).toBeTruthy();
          expect(result1.node_ident).toBe(testManageBody.node_ident);
          expect(result1.$promise.$$state.status).toBe(1);

          // Switch configs.
          var config2 = $$selectedConfiguration.set('test_config_2');
          $rootScope.$apply();
          expect(config2.ironic.apiRoot).toBe('http://ironic.example.com:2000');

          // Try a request
          $httpBackend.expectPUT('http://ironic.example.com:2000/nodes/test_id/states/provision')
            .respond(202);
          var result2 = IronicNodeProvision.update(testManageBody);
          expect(result2.$promise).toBeDefined();
          expect(result2.$resolved).toBeFalsy();
          $httpBackend.flush();
          expect(result2.$resolved).toBeTruthy();
          expect(result2.node_ident).toBe(testManageBody.node_ident);
          expect(result2.$promise.$$state.status).toBe(1);

          // Switch it back.
          var config3 = $$selectedConfiguration.set('test_config_1');
          $rootScope.$apply();
          expect(config3.ironic.apiRoot).toBe('http://ironic.example.com:1000');

          // Try a request
          $httpBackend.expectPUT('http://ironic.example.com:1000/nodes/test_id/states/provision')
            .respond(202);
          var result3 = IronicNodeProvision.update(testManageBody);
          expect(result3.$promise).toBeDefined();
          expect(result3.$resolved).toBeFalsy();
          $httpBackend.flush();
          expect(result3.$resolved).toBeTruthy();
          expect(result3.node_ident).toBe(testManageBody.node_ident);
          expect(result3.$promise.$$state.status).toBe(1);
        }));

      it('should return a \'resource-like\' object',
        inject(function(IronicNodeProvision, $$selectedConfiguration) {
          // Select #1
          var config1 = $$selectedConfiguration.set('test_config_1');
          $rootScope.$apply();
          expect(config1.ironic.apiRoot).toBe('http://ironic.example.com:1000');

          // Try a request
          $httpBackend.expectPUT('http://ironic.example.com:1000/nodes/test_id/states/provision')
            .respond(202);
          var result1 = IronicNodeProvision.update(testManageBody);
          expect(result1.$promise).toBeDefined();
          expect(result1.$resolved).toBeFalsy();
          $httpBackend.flush();
          expect(result1.$resolved).toBeTruthy();
          expect(result1.node_ident).toBe(testManageBody.node_ident);
          expect(result1.$promise.$$state.status).toBe(1);
        }));

      it('should return a failed resource if an invalid config has been selected',
        inject(function(IronicNodeProvision) {
          var updateResult = IronicNodeProvision.update(testManageBody);
          expect(angular.isObject(updateResult)).toBeTruthy();
          expect(updateResult.$promise).toBeDefined();
          expect(updateResult.$resolved).toBeFalsy();

          $rootScope.$apply();
          expect(updateResult.$resolved).toBeTruthy();
          expect(updateResult.$promise.$$state.status).toBe(2);
        }));

      it('should correctly parse error responses',
        inject(function(IronicNodeProvision, $$selectedConfiguration) {
          $$selectedConfiguration.set('test_config_1');
          $rootScope.$apply();

          // Try a request
          $httpBackend.expectPUT('http://ironic.example.com:1000/nodes/test_id/states/provision')
            .respond(400, {
              error_message: angular.toJson({
                debuginfo: null,
                faultcode: 'Client',
                faultstring: 'Test fault string'
              })
            });

          // Issue a request and attach a listener for the error response.
          var result = IronicNodeProvision.update(testManageBody);
          result.$promise.then(function() {
            expect(true).toBeFalsy(); // This must fail, we're checking for an error.
          }, function(error) {
            expect(error.data.error_message.faultcode).toBe('Client');
          });

          // Check and resolve the promise.
          expect(result.$promise).toBeDefined();
          expect(result.$resolved).toBeFalsy();
          $httpBackend.flush();
          expect(result.$resolved).toBeTruthy();
          expect(result.$promise.$$state.status).toBe(2);
        }));
    });
  });
