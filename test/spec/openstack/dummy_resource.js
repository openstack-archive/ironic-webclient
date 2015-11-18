/**
 * Unit tests for openstack's $$dummyResource component.
 */
describe('Unit: OpenStack $$dummyResource',
  function() {
    'use strict';

    var $rootScope;

    // We are testing the openstack module.
    beforeEach(module('openstack'));

    beforeEach(inject(function($injector) {
      // Set up the mock http service
      $rootScope = $injector.get('$rootScope');
    }));

    it('should implement a basic CRUD interface', inject(function($$dummyResource) {
      expect($$dummyResource.query).toBeDefined();
      expect($$dummyResource.create).toBeDefined();
      expect($$dummyResource.read).toBeDefined();
      expect($$dummyResource.update).toBeDefined();
      expect($$dummyResource.remove).toBeDefined();
    }));

    it('should always return the same instance', function() {
      var resource1, resource2;

      inject(function($$dummyResource) {
        resource1 = $$dummyResource;
      });
      inject(function($$dummyResource) {
        resource2 = $$dummyResource;
      });

      expect(resource1).toBeDefined();
      expect(resource2).toBeDefined();
      expect(resource1).toBe(resource2);
    });

    it('should return a failed array from the query method.',
      inject(function($$dummyResource) {
        var result = $$dummyResource.query({'id': 'meaningless'});
        expect(angular.isArray(result)).toBeTruthy();
        expect(result.$promise).toBeDefined();
        expect(result.$resolved).toBeFalsy();
        $rootScope.$apply();
        expect(result.$resolved).toBeTruthy();
        expect(result.$promise.$$state.status).toBe(2);
      }));

    it('should return a failed object from CRUD methods.',
      inject(function($$dummyResource) {
        var createResult = $$dummyResource.create({'id': 'meaningless'});
        expect(angular.isObject(createResult)).toBeTruthy();
        expect(createResult.$promise).toBeDefined();
        expect(createResult.$resolved).toBeFalsy();

        $rootScope.$apply();
        expect(createResult.$resolved).toBeTruthy();
        expect(createResult.$promise.$$state.status).toBe(2);

        var updateResult = $$dummyResource.update({'id': 'meaningless'});
        expect(angular.isObject(updateResult)).toBeTruthy();
        expect(updateResult.$promise).toBeDefined();
        expect(updateResult.$resolved).toBeFalsy();

        $rootScope.$apply();
        expect(updateResult.$resolved).toBeTruthy();
        expect(updateResult.$promise.$$state.status).toBe(2);

        var readResult = $$dummyResource.read({'id': 'meaningless'});
        expect(angular.isObject(readResult)).toBeTruthy();
        expect(readResult.$promise).toBeDefined();
        expect(readResult.$resolved).toBeFalsy();

        $rootScope.$apply();
        expect(readResult.$resolved).toBeTruthy();
        expect(readResult.$promise.$$state.status).toBe(2);

        var removeResult = $$dummyResource.remove({'id': 'meaningless'});
        expect(angular.isObject(removeResult)).toBeTruthy();
        expect(removeResult.$promise).toBeDefined();
        expect(removeResult.$resolved).toBeFalsy();

        $rootScope.$apply();
        expect(removeResult.$resolved).toBeTruthy();
        expect(removeResult.$promise.$$state.status).toBe(2);
      }));
  });
