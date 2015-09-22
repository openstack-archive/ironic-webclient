/**
 * Unit tests for openstack's $$memoryStorage component.
 */
describe('Unit: OpenStack $$memoryStorage',
  function() {
    'use strict';

    var stringValue = "some_string";
    var intValue = 2;

    // We are testing the openstack module.
    beforeEach(module('openstack'));

    it('should always be enabled', inject(function($$memoryStorage) {
      expect($$memoryStorage.isSupported()).toBeTruthy();
    }));

    it('should store and retrieve values', inject(function($$memoryStorage) {
      $$memoryStorage.set('string', stringValue);
      expect($$memoryStorage.get('string')).toEqual(stringValue);

      $$memoryStorage.set('int', intValue);
      expect($$memoryStorage.get('int')).toEqual(intValue);
    }));

    it('should be able to delete values', inject(function($$memoryStorage) {
      $$memoryStorage.set('string', stringValue);
      expect($$memoryStorage.get('string')).toEqual(stringValue);

      $$memoryStorage.remove('string');
      expect($$memoryStorage.get('string')).toBeUndefined();
    }));

    it('should be able to clear all', inject(function($$memoryStorage) {
      $$memoryStorage.set('string', stringValue);
      $$memoryStorage.set('int', intValue);

      $$memoryStorage.clearAll();
      expect($$memoryStorage.get('string')).toBeUndefined();
      expect($$memoryStorage.get('int')).toBeUndefined();
    }));

    it('should report a correct length', inject(function($$memoryStorage) {
      expect($$memoryStorage.length()).toEqual(0);
      $$memoryStorage.set('string', stringValue);
      expect($$memoryStorage.length()).toEqual(1);
      $$memoryStorage.set('int', intValue);
      expect($$memoryStorage.length()).toEqual(2);
      $$memoryStorage.remove('string');
      expect($$memoryStorage.length()).toEqual(1);
      $$memoryStorage.remove('int');
      expect($$memoryStorage.length()).toEqual(0);
    }));

    it('should provide an accurate list of keys', inject(function($$memoryStorage) {
      $$memoryStorage.set('string', stringValue);
      $$memoryStorage.set('int', intValue);

      expect($$memoryStorage.keys()).toContain('string');
      expect($$memoryStorage.keys()).toContain('int');
    }));
  });
