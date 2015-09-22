/**
 * Unit tests for openstack's $$sessionStorage component.
 */
describe('Unit: OpenStack $$sessionStorage',
  function() {
    'use strict';

    var stringValue = "some_string";
    var intValue = 2;

    // We are testing the openstack module.
    beforeEach(module('openstack'));

    it('should be enabled', inject(function($$sessionStorage) {
      expect($$sessionStorage.isSupported()).toBeTruthy();
    }));

    it('should store and retrieve values', inject(function($$sessionStorage) {
      $$sessionStorage.set('string', stringValue);
      expect($$sessionStorage.get('string')).toEqual(stringValue);

      $$sessionStorage.set('int', intValue);
      expect($$sessionStorage.get('int')).toEqual(intValue);
    }));

    it('should be able to delete values', inject(function($$sessionStorage) {
      $$sessionStorage.set('string', stringValue);
      expect($$sessionStorage.get('string')).toEqual(stringValue);

      $$sessionStorage.remove('string');
      expect($$sessionStorage.get('string')).toBeUndefined();
    }));

    it('should be able to clear all', inject(function($$sessionStorage) {
      $$sessionStorage.set('string', stringValue);
      $$sessionStorage.set('int', intValue);

      $$sessionStorage.clearAll();
      expect($$sessionStorage.get('string')).toBeUndefined();
      expect($$sessionStorage.get('int')).toBeUndefined();
    }));

    it('should report a correct length', inject(function($$sessionStorage) {
      expect($$sessionStorage.length()).toEqual(0);
      $$sessionStorage.set('string', stringValue);
      expect($$sessionStorage.length()).toEqual(1);
      $$sessionStorage.set('int', intValue);
      expect($$sessionStorage.length()).toEqual(2);
      $$sessionStorage.remove('string');
      expect($$sessionStorage.length()).toEqual(1);
      $$sessionStorage.remove('int');
      expect($$sessionStorage.length()).toEqual(0);
    }));

    it('should provide an accurate list of keys', inject(function($$sessionStorage) {
      $$sessionStorage.set('string', stringValue);
      $$sessionStorage.set('int', intValue);

      expect($$sessionStorage.keys()).toContain('string');
      expect($$sessionStorage.keys()).toContain('int');
    }));
  });

/**
 * This unit tests runs the same tests as above, except in an environment where the sessionStorage
 * mechanism has been disabled.
 */
describe('Unit: Disabled OpenStack $$sessionStorage', function() {
  'use strict';

  var stringValue = "some_string";
  var intValue = 2;

  beforeEach(function() {
    angular.mock.module('openstack', function($provide) {
      $provide.value('$window', {sessionStorage: undefined});
    });
  });

  it('should be disabled', inject(function($$sessionStorage) {
    expect($$sessionStorage.isSupported()).toBeFalsy();
  }));

  it('should not store values', inject(function($$sessionStorage) {
    $$sessionStorage.set('string', stringValue);
    expect($$sessionStorage.get('string')).toBeUndefined();

    $$sessionStorage.set('int', intValue);
    expect($$sessionStorage.get('int')).toBeUndefined();
  }));

  it('should not error on remove', inject(function($$sessionStorage) {
    $$sessionStorage.set('string', stringValue);
    expect($$sessionStorage.get('string')).toBeUndefined();
    $$sessionStorage.remove('string');
    expect($$sessionStorage.get('string')).toBeUndefined();
  }));

  it('should report a correct length', inject(function($$sessionStorage) {
    expect($$sessionStorage.length()).toEqual(0);
    $$sessionStorage.set('string', stringValue);
    expect($$sessionStorage.length()).toEqual(0);
    $$sessionStorage.set('int', intValue);
    expect($$sessionStorage.length()).toEqual(0);
  }));

  it('should do nothing on clearAll', inject(function($$sessionStorage) {
    expect($$sessionStorage.length()).toEqual(0);
    $$sessionStorage.set('string', stringValue);
    expect($$sessionStorage.length()).toEqual(0);
    $$sessionStorage.clearAll();
    expect($$sessionStorage.length()).toEqual(0);
  }));

  it('should provide an accurate list of keys', inject(function($$sessionStorage) {
    $$sessionStorage.set('string', stringValue);
    $$sessionStorage.set('int', intValue);

    expect($$sessionStorage.keys()).toEqual([]);
  }));
});

/**
 * In some runtimes, sessionStorage is available, however writing to/from it will
 * throw an error.
 */
describe('Unit: Erroring OpenStack $$sessionStorage', function() {
  'use strict';

  beforeEach(function() {
    angular.mock.module('openstack', function($provide) {
      $provide.value('$window', {
        sessionStorage: {
          setItem: function() {
            throw Error();
          },
          getItem: function() {
            throw Error();
          }
        }
      });
    });
  });

  it('should be disabled', inject(function($$sessionStorage) {
    expect($$sessionStorage.isSupported()).toBeFalsy();
  }));
});
