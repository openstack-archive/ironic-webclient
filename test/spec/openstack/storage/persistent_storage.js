/**
 * Unit tests for openstack's $$persistentStorage component, assuming localStorage is enabled.
 */
describe('Unit: OpenStack $$persistentStorage with localStorage available',
  function() {
    'use strict';

    // We are testing the openstack module.
    beforeEach(module('openstack'));

    it('should always be enabled', inject(function($$persistentStorage) {
      expect($$persistentStorage.isSupported()).toBeTruthy();
    }));

    it('should default to $$localStorage', inject(function($$persistentStorage, $$localStorage) {
      expect($$persistentStorage).toBe($$localStorage);
    }));
  });

/**
 * Unit tests for openstack's $$persistentStorage component, assuming localStorage is disabled.
 */
describe('Unit: OpenStack $$persistentStorage with localStorage disabled',
  function() {
    'use strict';

    // We are testing the openstack module.
    beforeEach(function() {
      angular.mock.module('openstack', function($provide) {
        $provide.value('$$localStorage', {
          isSupported: function() {
            return false;
          }
        });
      });
    });

    it('should always be enabled', inject(function($$persistentStorage) {
      expect($$persistentStorage.isSupported()).toBeTruthy();
    }));

    it('should default to $$cookieStorage', inject(function($$persistentStorage, $$cookieStorage) {
      expect($$persistentStorage).toBe($$cookieStorage);
    }));
  });

/**
 * Unit tests for openstack's $$persistentStorage component, assuming localStorage and
 * cookieStorage are disabled.
 */
describe('Unit: OpenStack $$persistentStorage with localStorage and cookieStorage disabled',
  function() {
    'use strict';

    // We are testing the openstack module.
    beforeEach(function() {
      angular.mock.module('openstack', function($provide) {
        $provide.value('$$localStorage', {
          isSupported: function() {
            return false;
          }
        });
        $provide.value('$$cookieStorage', {
          isSupported: function() {
            return false;
          }
        });
      });
    });

    it('should always be enabled', inject(function($$persistentStorage) {
      expect($$persistentStorage.isSupported()).toBeTruthy();
    }));

    it('should default to $$cookieStorage', inject(function($$persistentStorage, $$memoryStorage) {
      expect($$persistentStorage).toBe($$memoryStorage);
    }));
  });
