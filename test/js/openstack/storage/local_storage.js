/**
 * Unit tests for openstack's $$localStorage component, assuming localStorage is enabled.
 */
describe('Unit: OpenStack $$localStorage',
  function() {
    'use strict';

    var stringValue = "some_string";
    var intValue = 2;

    // We are testing the openstack module.
    beforeEach(module('openstack'));

    it('should be enabled', inject(function($$localStorage) {
      expect($$localStorage.isSupported()).toBeTruthy();
    }));

    it('should store and retrieve values', inject(function($$localStorage) {
      $$localStorage.set('string', stringValue);
      expect($$localStorage.get('string')).toEqual(stringValue);

      $$localStorage.set('int', intValue);
      expect($$localStorage.get('int')).toEqual(intValue);
    }));

    it('should be able to delete values', inject(function($$localStorage) {
      $$localStorage.set('string', stringValue);
      expect($$localStorage.get('string')).toEqual(stringValue);

      $$localStorage.remove('string');
      expect($$localStorage.get('string')).toBeUndefined();
    }));

    it('should be able to clear all', inject(function($$localStorage) {
      $$localStorage.set('string', stringValue);
      $$localStorage.set('int', intValue);

      $$localStorage.clearAll();
      expect($$localStorage.get('string')).toBeUndefined();
      expect($$localStorage.get('int')).toBeUndefined();
    }));

    it('should report a correct length', inject(function($$localStorage) {
      expect($$localStorage.length()).toEqual(0);
      $$localStorage.set('string', stringValue);
      expect($$localStorage.length()).toEqual(1);
      $$localStorage.set('int', intValue);
      expect($$localStorage.length()).toEqual(2);
      $$localStorage.remove('string');
      expect($$localStorage.length()).toEqual(1);
      $$localStorage.remove('int');
      expect($$localStorage.length()).toEqual(0);
    }));

    it('should provide an accurate list of keys', inject(function($$localStorage) {
      $$localStorage.set('string', stringValue);
      $$localStorage.set('int', intValue);

      expect($$localStorage.keys()).toContain('string');
      expect($$localStorage.keys()).toContain('int');
    }));
  });

/**
 * This unit tests runs the same tests as above, except in an environment where the localStorage
 * mechanism has been disabled.
 */
describe('Unit: Disabled OpenStack $$localStorage', function() {
  'use strict';

  var stringValue = "some_string";
  var intValue = 2;

  beforeEach(function() {
    angular.mock.module('openstack', function($provide) {
      $provide.value('$window', {localStorage: undefined});
    });
  });

  it('should be disabled', inject(function($$localStorage) {
    expect($$localStorage.isSupported()).toBeFalsy();
  }));

  it('should not store values', inject(function($$localStorage) {
    $$localStorage.set('string', stringValue);
    expect($$localStorage.get('string')).toBeUndefined();

    $$localStorage.set('int', intValue);
    expect($$localStorage.get('int')).toBeUndefined();
  }));

  it('should not error on remove', inject(function($$localStorage) {
    $$localStorage.set('string', stringValue);
    expect($$localStorage.get('string')).toBeUndefined();
    $$localStorage.remove('string');
    expect($$localStorage.get('string')).toBeUndefined();
  }));

  it('should report a correct length', inject(function($$localStorage) {
    expect($$localStorage.length()).toEqual(0);
    $$localStorage.set('string', stringValue);
    expect($$localStorage.length()).toEqual(0);
    $$localStorage.set('int', intValue);
    expect($$localStorage.length()).toEqual(0);
  }));

  it('should do nothing on clearAll', inject(function($$localStorage) {
    expect($$localStorage.length()).toEqual(0);
    $$localStorage.set('string', stringValue);
    expect($$localStorage.length()).toEqual(0);
    $$localStorage.clearAll();
    expect($$localStorage.length()).toEqual(0);
  }));

  it('should provide an accurate list of keys', inject(function($$localStorage) {
    $$localStorage.set('string', stringValue);
    $$localStorage.set('int', intValue);

    expect($$localStorage.keys()).toEqual([]);
  }));
});

/**
 * In some runtimes, localStorage is available, however writing to/from it will
 * throw an error.
 */
describe('Unit: Erroring OpenStack $$localStorage', function() {
  'use strict';

  beforeEach(function() {
    angular.mock.module('openstack', function($provide) {
      $provide.value('$window', {
        localStorage: {
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

  it('should be disabled', inject(function($$localStorage) {
    expect($$localStorage.isSupported()).toBeFalsy();
  }));
});
