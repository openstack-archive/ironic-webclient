/**
 * Unit tests for ironic's ngResource IronicNode implementation.
 */
describe('Unit: OpenStack Ironic Node Resource',
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

    it('should implement a basic CRUD interface',
      inject(function(IronicNode) {
        expect(IronicNode.query).toBeDefined();
        expect(IronicNode.create).toBeDefined();
        expect(IronicNode.read).toBeDefined();
        expect(IronicNode.update).toBeDefined();
        expect(IronicNode.remove).toBeDefined();
      }));

    it('should switch API requests if the configuration changes.',
      inject(function(IronicNode, $$selectedConfiguration) {
        // Select #1
        var config1 = $$selectedConfiguration.set('test_config_1');
        $rootScope.$apply();
        expect(config1.ironic.apiRoot).toBe('http://ironic.example.com:1000');

        // Try a request
        $httpBackend.expectGET('http://ironic.example.com:1000/nodes')
          .respond(200, {'nodes': [{}]});
        var result1 = IronicNode.query({});
        expect(result1.$promise).toBeDefined();
        expect(result1.$resolved).toBeFalsy();
        $httpBackend.flush();
        expect(result1.$resolved).toBeTruthy();
        expect(result1.length).toBe(1);
        expect(result1.$promise.$$state.status).toBe(1);

        // Switch configs.
        var config2 = $$selectedConfiguration.set('test_config_2');
        $rootScope.$apply();
        expect(config2.ironic.apiRoot).toBe('http://ironic.example.com:2000');

        // Try a request
        $httpBackend.expect('GET', 'http://ironic.example.com:2000/nodes')
          .respond(200, {'nodes': [{}, {}]});
        var result2 = IronicNode.query({});
        expect(result2.$promise).toBeDefined();
        expect(result2.$resolved).toBeFalsy();
        $httpBackend.flush();
        expect(result2.$resolved).toBeTruthy();
        expect(result2.length).toBe(2);
        expect(result2.$promise.$$state.status).toBe(1);

        // Switch it back.
        var config3 = $$selectedConfiguration.set('test_config_1');
        $rootScope.$apply();
        expect(config3.ironic.apiRoot).toBe('http://ironic.example.com:1000');

        // Try a request
        $httpBackend.expect('GET', 'http://ironic.example.com:1000/nodes')
          .respond(200, {'nodes': [{}]});
        var result3 = IronicNode.query({});
        expect(result3.$promise).toBeDefined();
        expect(result3.$resolved).toBeFalsy();
        $httpBackend.flush();
        expect(result3.$resolved).toBeTruthy();
        expect(result3.length).toBe(1);
        expect(result3.$promise.$$state.status).toBe(1);
      }));

    it('should return a failed resource if an invalid config has been selected',
      inject(function(IronicNode) {
        var queryResult = IronicNode.query({'id': 'meaningless'});
        expect(angular.isArray(queryResult)).toBeTruthy();
        expect(queryResult.$promise).toBeDefined();
        expect(queryResult.$resolved).toBeFalsy();

        var createResult = IronicNode.create({'id': 'meaningless'});
        expect(angular.isObject(createResult)).toBeTruthy();
        expect(createResult.$promise).toBeDefined();
        expect(createResult.$resolved).toBeFalsy();

        $rootScope.$apply();
        expect(createResult.$resolved).toBeTruthy();
        expect(createResult.$promise.$$state.status).toBe(2);

        var updateResult = IronicNode.update({'id': 'meaningless'});
        expect(angular.isObject(updateResult)).toBeTruthy();
        expect(updateResult.$promise).toBeDefined();
        expect(updateResult.$resolved).toBeFalsy();

        $rootScope.$apply();
        expect(updateResult.$resolved).toBeTruthy();
        expect(updateResult.$promise.$$state.status).toBe(2);

        var readResult = IronicNode.read({'id': 'meaningless'});
        expect(angular.isObject(readResult)).toBeTruthy();
        expect(readResult.$promise).toBeDefined();
        expect(readResult.$resolved).toBeFalsy();

        $rootScope.$apply();
        expect(readResult.$resolved).toBeTruthy();
        expect(readResult.$promise.$$state.status).toBe(2);

        var removeResult = IronicNode.remove({'id': 'meaningless'});
        expect(angular.isObject(removeResult)).toBeTruthy();
        expect(removeResult.$promise).toBeDefined();
        expect(removeResult.$resolved).toBeFalsy();

        $rootScope.$apply();
        expect(removeResult.$resolved).toBeTruthy();
        expect(removeResult.$promise.$$state.status).toBe(2);
      }));
  });
