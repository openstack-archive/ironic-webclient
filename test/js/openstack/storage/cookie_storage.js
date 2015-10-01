/**
 * Unit tests for openstack's $$cookieStorage component.
 */
describe('Unit: OpenStack $$cookieStorage',
  function() {
    'use strict';

    var stringValue = "some_string";
    var intValue = 2;

    // We are testing the openstack module.
    beforeEach(module('openstack'));

    it('should always be enabled', inject(function($$cookieStorage) {
      expect($$cookieStorage.isSupported()).toBeTruthy();
    }));

    it('should store and retrieve values', inject(function($$cookieStorage) {
      $$cookieStorage.set('string', stringValue);
      expect($$cookieStorage.get('string')).toEqual(stringValue);

      $$cookieStorage.set('int', intValue);
      expect($$cookieStorage.get('int')).toEqual(intValue);
    }));

    it('should be able to delete values', inject(function($$cookieStorage) {
      $$cookieStorage.set('string', stringValue);
      expect($$cookieStorage.get('string')).toEqual(stringValue);

      $$cookieStorage.remove('string');
      expect($$cookieStorage.get('string')).toBeUndefined();
    }));

    it('should be able to clear all', inject(function($$cookieStorage) {
      $$cookieStorage.set('string', stringValue);
      $$cookieStorage.set('int', intValue);

      $$cookieStorage.clearAll();
      expect($$cookieStorage.get('string')).toBeUndefined();
      expect($$cookieStorage.get('int')).toBeUndefined();
    }));

    it('should report a correct length', inject(function($$cookieStorage) {
      expect($$cookieStorage.length()).toEqual(0);
      $$cookieStorage.set('string', stringValue);
      expect($$cookieStorage.length()).toEqual(1);
      $$cookieStorage.set('int', intValue);
      expect($$cookieStorage.length()).toEqual(2);
      $$cookieStorage.remove('string');
      expect($$cookieStorage.length()).toEqual(1);
      $$cookieStorage.remove('int');
      expect($$cookieStorage.length()).toEqual(0);
    }));

    it('should provide an accurate list of keys', inject(function($$cookieStorage) {
      $$cookieStorage.set('string', stringValue);
      $$cookieStorage.set('int', intValue);

      expect($$cookieStorage.keys()).toContain('string');
      expect($$cookieStorage.keys()).toContain('int');
    }));
  });
