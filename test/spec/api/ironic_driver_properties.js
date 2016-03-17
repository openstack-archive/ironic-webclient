/**
 * Unit tests for ironic's ngResource Ironic Driver Properties implementation.
 */
describe('Unit: OpenStack Ironic Driver Properties Resource',
  function() {
    'use strict';

    var $rootScope, $httpBackend;

    // Create some test data
    var testReturnData = {
      foo: 'bar'
    };

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
      inject(function(IronicDriverProperties) {
        expect(IronicDriverProperties.read).toBeDefined("must have read() method");
      }));

    it('should switch API requests if the configuration changes.',
      inject(function(IronicDriverProperties, $$selectedConfiguration) {

        // Select #1
        var config1 = $$selectedConfiguration.set('test_config_1');
        $rootScope.$apply();
        expect(config1.ironic.apiRoot).toBe('http://ironic.example.com:1000');

        // Try a request
        $httpBackend
          .expectGET('http://ironic.example.com:1000/drivers/properties?driver_name=foo')
          .respond(200, testReturnData);
        var result1 = IronicDriverProperties.read({driver_name: 'foo'});
        expect(result1.$promise).toBeDefined();
        expect(result1.$resolved).toBeFalsy();
        $httpBackend.flush();
        expect(result1.$resolved).toBeTruthy();
        expect(result1.$promise.$$state.status).toBe(1);

        // Switch configs.
        var config2 = $$selectedConfiguration.set('test_config_2');
        $rootScope.$apply();
        expect(config2.ironic.apiRoot).toBe('http://ironic.example.com:2000');

        // Try a request
        $httpBackend
          .expect('GET', 'http://ironic.example.com:2000/drivers/properties?driver_name=foo')
          .respond(200, testReturnData);
        var result2 = IronicDriverProperties.read({driver_name: 'foo'});
        expect(result2.$promise).toBeDefined();
        expect(result2.$resolved).toBeFalsy();
        $httpBackend.flush();
        expect(result2.$resolved).toBeTruthy();
        expect(result2.$promise.$$state.status).toBe(1);

        // Switch it back.
        var config3 = $$selectedConfiguration.set('test_config_1');
        $rootScope.$apply();
        expect(config3.ironic.apiRoot).toBe('http://ironic.example.com:1000');

        // Try a request
        $httpBackend
          .expect('GET', 'http://ironic.example.com:1000/drivers/properties?driver_name=foo')
          .respond(200, testReturnData);
        var result3 = IronicDriverProperties.read({driver_name: 'foo'});
        expect(result3.$promise).toBeDefined();
        expect(result3.$resolved).toBeFalsy();
        $httpBackend.flush();
        expect(result3.$resolved).toBeTruthy();
        expect(result3.$promise.$$state.status).toBe(1);
      }));

    it('should return a failed resource if an invalid config has been selected',
      inject(function(IronicDriverProperties) {
        var queryResult = IronicDriverProperties.read({driver_name: 'foo'});
        expect(queryResult.$promise).toBeDefined();
        expect(queryResult.$resolved).toBeFalsy();
      }));

    it('should correctly parse query error responses',
      inject(function(IronicDriverProperties, $$selectedConfiguration) {
        $$selectedConfiguration.set('test_config_1');
        $rootScope.$apply();

        // Try a request
        $httpBackend.expectGET('http://ironic.example.com:1000/drivers/properties?driver_name=foo')
          .respond(400, {
            error_message: angular.toJson({
              debuginfo: null,
              faultcode: 'Client',
              faultstring: 'Test fault string'
            })
          });

        // Issue a request and attach a listener for the error response.
        var result = IronicDriverProperties.read({driver_name: 'foo'});
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

    it('should correctly parse CRUD regular responses',
      inject(function(IronicDriverProperties, $$selectedConfiguration) {
        $$selectedConfiguration.set('test_config_1');
        $rootScope.$apply();

        // Try a request
        $httpBackend
          .expectGET('http://ironic.example.com:1000/drivers/properties?driver_name=foo')
          .respond(200, testReturnData);

        // Issue a request and attach a listener for the error response.
        var result = IronicDriverProperties.read({driver_name: 'foo'});
        // Check and resolve the promise.
        expect(result.$promise).toBeDefined();
        expect(result.$resolved).toBeFalsy();
        $httpBackend.flush();
        expect(result.$resolved).toBeTruthy();
        expect(result.$promise.$$state.status).toBe(1);
        expect(result.foo).toBe('bar');
      }));

    it('should correctly parse CRUD error responses',
      inject(function(IronicDriverProperties, $$selectedConfiguration) {
        $$selectedConfiguration.set('test_config_1');
        $rootScope.$apply();

        // Try a request
        $httpBackend
          .expectGET('http://ironic.example.com:1000/drivers/properties?driver_name=foo')
          .respond(400, {
            error_message: angular.toJson({
              debuginfo: null,
              faultcode: 'Client',
              faultstring: 'Test fault string'
            })
          });

        // Issue a request and attach a listener for the error response.
        var result = IronicDriverProperties.read({driver_name: 'foo'});
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
