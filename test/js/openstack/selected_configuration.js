/**
 * Unit tests for openstack's cloud $$selectedConfiguration provider
 */
describe('Unit: OpenStack $$selectedConfiguration',
  function() {
    'use strict';

    var $rootScope, $$configProvider, $$persistentStorage;
    var storageKey = '$$selectedConfiguration';

    // Load the openstack module.
    beforeEach(module('openstack'));
    beforeEach(module(function($$configurationProvider) {
      // Store this for later use.
      $$configProvider = $$configurationProvider;

      $$configurationProvider.$addConfig({
        'id': 'testConfig1',
        'ironic': {
          'apiRoot': 'http://example.com:6385'
        }
      });
      $$configurationProvider.$addConfig({
        'id': 'testConfig2',
        'ironic': {
          'apiRoot': 'http://ironic.example.com:6385'
        }
      });
    }));

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
        $$persistentStorage.set(storageKey, 'testConfig2');

        var selected = $$selectedConfiguration.get();
        expect(selected.$promise).toBeDefined();
        expect(selected.$resolved).toBeFalsy();
        $rootScope.$apply();
        expect(selected.$resolved).toBeTruthy();
        expect(selected.$promise.$$state.status).toEqual(1);
        expect(selected.id).toEqual('testConfig2');
        expect(selected.ironic.apiRoot).toEqual('http://ironic.example.com:6385');
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
        var selected = $$selectedConfiguration.set('testConfig1');
        expect(selected.$promise).toBeDefined();
        expect(selected.$resolved).toBeFalsy();
        $rootScope.$apply();
        expect(selected.$resolved).toBeTruthy();
        expect(selected.$promise.$$state.status).toEqual(1);
        expect(selected.id).toEqual('testConfig1');
        expect($$persistentStorage.get(storageKey)).toEqual('testConfig1');

        // Change it again, this time using an object
        var selectedTwo = $$selectedConfiguration.set({id: 'testConfig2'});
        expect(selectedTwo.$promise).toBeDefined();
        expect(selectedTwo.$resolved).toBeFalsy();
        $rootScope.$apply();
        expect(selectedTwo.$resolved).toBeTruthy();
        expect(selectedTwo.$promise.$$state.status).toEqual(1);
        expect(selectedTwo.id).toEqual('testConfig2');
        expect($$persistentStorage.get(storageKey)).toEqual('testConfig2');
      }));

    it('should not permit the selection of an invalid configuration',
      inject(function($$selectedConfiguration) {
        var selected = $$selectedConfiguration.set('testConfig1');
        expect(selected.$promise).toBeDefined();
        expect(selected.$resolved).toBeFalsy();
        $rootScope.$apply();
        expect(selected.$resolved).toBeTruthy();
        expect(selected.$promise.$$state.status).toEqual(1);
        expect(selected.id).toEqual('testConfig1');
        expect($$persistentStorage.get(storageKey)).toEqual('testConfig1');

        // Change it again
        var selectedTwo = $$selectedConfiguration.set('invalidKey');
        expect(selectedTwo.$promise).toBeDefined();
        expect(selectedTwo.$resolved).toBeFalsy();
        $rootScope.$apply();
        expect(selectedTwo.$resolved).toBeTruthy();
        expect(selectedTwo.$promise.$$state.status).toEqual(2);
        expect(selectedTwo.id).toEqual('invalidKey');
        expect($$persistentStorage.get(storageKey)).toEqual('testConfig1');
      }));
  });
