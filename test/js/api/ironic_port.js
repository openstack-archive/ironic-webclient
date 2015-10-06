/**
 * Unit tests for ironic's ngResource IronicPort implementation.
 */
describe('Unit: OpenStack Ironic Port Resource',
  function() {
    'use strict';

    var $rootScope, $httpBackend, $$configuration, $configProvider;

    // We are testing the ironic.api module.
    beforeEach(module('ironic.api'));
    beforeEach(module(function($$configurationProvider) {
      $configProvider = $$configurationProvider;
    }));

    beforeEach(inject(function($injector) {
      // Set up the mock http service
      $rootScope = $injector.get('$rootScope');
      $httpBackend = $injector.get('$httpBackend');
      $$configuration = $injector.get('$$configuration');
    }));

    afterEach(inject(function($$persistentStorage) {
      // Clear any config selections we've made.
      $$persistentStorage.remove('$$selectedConfiguration');

      // Assert no outstanding requests.
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    }));

    it('should implement a basic CRUD interface',
      inject(function(IronicPort) {
        expect(IronicPort.query).toBeDefined();
        expect(IronicPort.create).toBeDefined();
        expect(IronicPort.read).toBeDefined();
        expect(IronicPort.update).toBeDefined();
        expect(IronicPort.remove).toBeDefined();
      }));

    it('should switch API requests if the configuration changes.',
      inject(function(IronicPort, $$selectedConfiguration) {
        var testConfig1 = {
          id: 'test1',
          ironic: {'apiRoot': 'http://ironic.example.com:1000'}
        };
        var testConfig2 = {
          id: 'test2',
          ironic: {'apiRoot': 'http://ironic.example.com:2000'}
        };

        // Add some configurations.
        $configProvider.$addConfig(testConfig1);
        $configProvider.$addConfig(testConfig2);

        // Select #1
        var config1 = $$selectedConfiguration.set('test1');
        $rootScope.$apply();
        expect(config1.ironic.apiRoot).toBe(testConfig1.ironic.apiRoot);

        // Try a request
        $httpBackend.expectGET('http://ironic.example.com:1000/ports')
          .respond(200, {'ports': [{}]});
        var result1 = IronicPort.query({});
        expect(result1.$promise).toBeDefined();
        expect(result1.$resolved).toBeFalsy();
        $httpBackend.flush();
        expect(result1.$resolved).toBeTruthy();
        expect(result1.length).toBe(1);
        expect(result1.$promise.$$state.status).toBe(1);

        // Switch configs.
        var config2 = $$selectedConfiguration.set('test2');
        $rootScope.$apply();
        expect(config2.ironic.apiRoot).toBe(testConfig2.ironic.apiRoot);

        // Try a request
        $httpBackend.expect('GET', 'http://ironic.example.com:2000/ports')
          .respond(200, {'ports': [{}, {}]});
        var result2 = IronicPort.query({});
        expect(result2.$promise).toBeDefined();
        expect(result2.$resolved).toBeFalsy();
        $httpBackend.flush();
        expect(result2.$resolved).toBeTruthy();
        expect(result2.length).toBe(2);
        expect(result2.$promise.$$state.status).toBe(1);

        // Switch it back.
        var config3 = $$selectedConfiguration.set('test1');
        $rootScope.$apply();
        expect(config3.ironic.apiRoot).toBe(testConfig1.ironic.apiRoot);

        // Try a request
        $httpBackend.expect('GET', 'http://ironic.example.com:1000/ports')
          .respond(200, {'ports': [{}]});
        var result3 = IronicPort.query({});
        expect(result3.$promise).toBeDefined();
        expect(result3.$resolved).toBeFalsy();
        $httpBackend.flush();
        expect(result3.$resolved).toBeTruthy();
        expect(result3.length).toBe(1);
        expect(result3.$promise.$$state.status).toBe(1);
      }));

    it('should return a failed resource if an invalid config has been selected',
      inject(function(IronicPort) {
        var queryResult = IronicPort.query({'id': 'meaningless'});
        expect(angular.isArray(queryResult)).toBeTruthy();
        expect(queryResult.$promise).toBeDefined();
        expect(queryResult.$resolved).toBeFalsy();

        var createResult = IronicPort.create({'id': 'meaningless'});
        expect(angular.isObject(createResult)).toBeTruthy();
        expect(createResult.$promise).toBeDefined();
        expect(createResult.$resolved).toBeFalsy();

        $rootScope.$apply();
        expect(createResult.$resolved).toBeTruthy();
        expect(createResult.$promise.$$state.status).toBe(2);

        var updateResult = IronicPort.update({'id': 'meaningless'});
        expect(angular.isObject(updateResult)).toBeTruthy();
        expect(updateResult.$promise).toBeDefined();
        expect(updateResult.$resolved).toBeFalsy();

        $rootScope.$apply();
        expect(updateResult.$resolved).toBeTruthy();
        expect(updateResult.$promise.$$state.status).toBe(2);

        var readResult = IronicPort.read({'id': 'meaningless'});
        expect(angular.isObject(readResult)).toBeTruthy();
        expect(readResult.$promise).toBeDefined();
        expect(readResult.$resolved).toBeFalsy();

        $rootScope.$apply();
        expect(readResult.$resolved).toBeTruthy();
        expect(readResult.$promise.$$state.status).toBe(2);

        var removeResult = IronicPort.remove({'id': 'meaningless'});
        expect(angular.isObject(removeResult)).toBeTruthy();
        expect(removeResult.$promise).toBeDefined();
        expect(removeResult.$resolved).toBeFalsy();

        $rootScope.$apply();
        expect(removeResult.$resolved).toBeTruthy();
        expect(removeResult.$promise.$$state.status).toBe(2);
      }));
  });