/**
 * Unit tests for openstack's cloud $$selectedConfiguration provider
 */
describe('Unit: OpenStack $$selectedConfiguration',
  function() {
    'use strict';

    var $rootScope, $$persistentStorage;
    var storageKey = '$$selectedConfiguration';

    // Load the openstack module.
    beforeEach(module('openstack.mock.$$configuration'));
    beforeEach(module('openstack'));

    beforeEach(inject(function($injector) {
      // Grab a copy of the rootscope.
      $rootScope = $injector.get('$rootScope');
      $$persistentStorage = $injector.get('$$persistentStorage');
    }));

    afterEach(function() {
      $$persistentStorage.remove(storageKey);
    });

    it('should exist',
      inject(function($$selectedConfiguration) {
        expect($$selectedConfiguration).toBeTruthy();
      }));

    it('should resolve to an invalid configuration when unset.',
      inject(function($$selectedConfiguration) {
        var selected = $$selectedConfiguration.get();
        expect(selected.$promise).toBeDefined();
        expect(selected.$resolved).toBeFalsy();
        $rootScope.$apply();
        expect(selected.$resolved).toBeTruthy();
        expect(selected.$promise.$$state.status).toEqual(2);
      }));

    it('should resolve a valid selected configuration',
      inject(function($$selectedConfiguration) {
        $$persistentStorage.set(storageKey, 'test_config_2');

        var selected = $$selectedConfiguration.get();
        expect(selected.$promise).toBeDefined();
        expect(selected.$resolved).toBeFalsy();
        $rootScope.$apply();
        expect(selected.$resolved).toBeTruthy();
        expect(selected.$promise.$$state.status).toEqual(1);
        expect(selected.id).toEqual('test_config_2');
        expect(selected.ironic.apiRoot).toEqual('http://ironic.example.com:2000');
      }));

    it('should resolve to an invalid configuration if the stored ID does not exist',
      inject(function($$selectedConfiguration) {
        $$persistentStorage.set(storageKey, 'invalidStorageKey');

        var selected = $$selectedConfiguration.get();
        expect(selected.$promise).toBeDefined();
        expect(selected.$resolved).toBeFalsy();
        $rootScope.$apply();
        expect(selected.$resolved).toBeTruthy();
        expect(selected.$promise.$$state.status).toEqual(2);
        expect(selected.id).toEqual('invalidStorageKey');
        expect(selected.ironic).toBeUndefined();
      }));

    it('should clear any invalid selection key that is encountered',
      inject(function($$selectedConfiguration) {
        $$persistentStorage.set(storageKey, 'invalidStorageKey');

        var selected = $$selectedConfiguration.get();
        expect(selected.$promise).toBeDefined();
        expect(selected.$resolved).toBeFalsy();
        $rootScope.$apply();
        expect(selected.$resolved).toBeTruthy();
        expect(selected.$promise.$$state.status).toEqual(2);

        expect($$persistentStorage.get(storageKey)).toBeUndefined();
      }));

    it('should permit the selection of a valid configuration',
      inject(function($$selectedConfiguration) {
        var selected = $$selectedConfiguration.set('test_config_1');
        expect(selected.$promise).toBeDefined();
        expect(selected.$resolved).toBeFalsy();
        $rootScope.$apply();
        expect(selected.$resolved).toBeTruthy();
        expect(selected.$promise.$$state.status).toEqual(1);
        expect(selected.id).toEqual('test_config_1');
        expect($$persistentStorage.get(storageKey)).toEqual('test_config_1');

        // Change it again, this time using an object
        var selectedTwo = $$selectedConfiguration.set({id: 'test_config_2'});
        expect(selectedTwo.$promise).toBeDefined();
        expect(selectedTwo.$resolved).toBeFalsy();
        $rootScope.$apply();
        expect(selectedTwo.$resolved).toBeTruthy();
        expect(selectedTwo.$promise.$$state.status).toEqual(1);
        expect(selectedTwo.id).toEqual('test_config_2');
        expect($$persistentStorage.get(storageKey)).toEqual('test_config_2');
      }));

    it('should not permit the selection of an invalid configuration',
      inject(function($$selectedConfiguration) {
        var selected = $$selectedConfiguration.set('test_config_1');
        expect(selected.$promise).toBeDefined();
        expect(selected.$resolved).toBeFalsy();
        $rootScope.$apply();
        expect(selected.$resolved).toBeTruthy();
        expect(selected.$promise.$$state.status).toEqual(1);
        expect(selected.id).toEqual('test_config_1');
        expect($$persistentStorage.get(storageKey)).toEqual('test_config_1');

        // Change it again
        var selectedTwo = $$selectedConfiguration.set('invalidKey');
        expect(selectedTwo.$promise).toBeDefined();
        expect(selectedTwo.$resolved).toBeFalsy();
        $rootScope.$apply();
        expect(selectedTwo.$resolved).toBeTruthy();
        expect(selectedTwo.$promise.$$state.status).toEqual(2);
        expect(selectedTwo.id).toEqual('invalidKey');
        expect($$persistentStorage.get(storageKey)).toEqual('test_config_1');

        // Change it again, this time using an object
        var selected3 = $$selectedConfiguration.set({});
        expect(selected3.$promise).toBeDefined();
        expect(selected3.$resolved).toBeFalsy();
        $rootScope.$apply();
        expect(selected3.$resolved).toBeTruthy();
        expect(selected3.$promise.$$state.status).toEqual(2);
        expect(selected3.id).toBe(null);
        expect($$persistentStorage.get(storageKey)).toEqual('test_config_1');
      }));

    it('should only resolve the configuration promise once.',
      inject(function($$selectedConfiguration) {
        var selected = $$selectedConfiguration.set('test_config_1');
        expect(selected.$promise).toBeDefined();
        expect(selected.$resolved).toBeFalsy();
        $rootScope.$apply();
        expect(selected.$resolved).toBeTruthy();
        expect(selected.$promise.$$state.status).toEqual(1);

        // They must be identical
        expect($$selectedConfiguration.get()).toBe(selected);

        // Setting the same ID should do nothing.
        var selected2 = $$selectedConfiguration.set('test_config_1');
        $rootScope.$apply();
        expect(selected2).toBe(selected);
      }));

    it('should return the same configuration if still resolving.',
      inject(function($$selectedConfiguration) {
        var selected = $$selectedConfiguration.set('test_config_1');
        expect(selected.$promise).toBeDefined();
        expect(selected.$resolved).toBeFalsy();
        var selected2 = $$selectedConfiguration.set('test_config_1');
        expect(selected).toBe(selected2);
        var selected3 = $$selectedConfiguration.get('test_config_1');
        expect(selected).toBe(selected3);
      }));
  });
