/**
 * Unit tests for openstack's $$resourceCache component.
 */
describe('Unit: OpenStack $$resourceCache',
  function() {
    'use strict';

    // We are testing the openstack module.
    beforeEach(module('openstack'));

    var testResource1Key = 'http://somedomain.com:6385';
    var testResource1 = {name: 1};
    var testResource2Key = 'http://otherdomain.com:6385';
    var testResource2 = {name: 2};

    it('should store and retrieve resources', inject(function($$resourceCache) {
      $$resourceCache.set(testResource1Key, testResource1);
      expect($$resourceCache.get(testResource1Key)).toEqual(testResource1);

      $$resourceCache.set(testResource2Key, testResource2);
      expect($$resourceCache.get(testResource2Key)).toEqual(testResource2);
    }));

    it('should return undefined on nonexistent key', inject(function($$resourceCache) {
      expect($$resourceCache.get(testResource1Key)).toBeUndefined();
    }));

    it('should correctly report existence of resources', inject(function($$resourceCache) {
      $$resourceCache.set(testResource1Key, testResource1);
      expect($$resourceCache.has(testResource1Key)).toBeTruthy();
      expect($$resourceCache.get(testResource2Key)).toBeFalsy();
    }));

    it('should be able to remove resources', inject(function($$resourceCache) {
      $$resourceCache.set(testResource1Key, testResource1);
      expect($$resourceCache.get(testResource1Key)).toEqual(testResource1);

      $$resourceCache.remove(testResource1Key);
      expect($$resourceCache.get(testResource1Key)).toBeUndefined();

      // Do not error on invalid key.
      $$resourceCache.remove(testResource1Key);
      expect($$resourceCache.get(testResource1Key)).toBeUndefined();
    }));

    it('should provide an accurate list of keys', inject(function($$resourceCache) {
      $$resourceCache.set(testResource1Key, testResource1);
      $$resourceCache.set(testResource2Key, testResource2);

      expect($$resourceCache.keys()).toContain(testResource1Key);
      expect($$resourceCache.keys()).toContain(testResource2Key);
    }));

    it('should be able to clear all', inject(function($$resourceCache) {
      $$resourceCache.set(testResource1Key, testResource1);
      $$resourceCache.set(testResource2Key, testResource2);

      $$resourceCache.clearAll();
      expect($$resourceCache.get(testResource1Key)).toBeUndefined();
      expect($$resourceCache.get(testResource2Key)).toBeUndefined();
    }));

    it('should report a correct length', inject(function($$resourceCache) {
      expect($$resourceCache.length()).toEqual(0);
      $$resourceCache.set(testResource1Key, testResource1);
      expect($$resourceCache.length()).toEqual(1);
      $$resourceCache.set(testResource2Key, testResource2);
      expect($$resourceCache.length()).toEqual(2);
      $$resourceCache.remove(testResource1Key);
      expect($$resourceCache.length()).toEqual(1);
      $$resourceCache.remove(testResource2Key);
      expect($$resourceCache.length()).toEqual(0);
    }));
  });
