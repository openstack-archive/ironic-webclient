/**
 * Unit tests for openstack's cloud $$configuration loader.
 */
describe('Unit: OpenStack $$configuration',
  function() {
    'use strict';

    // Load the openstack module.
    beforeEach(module('openstack'));

    it('should exist',
      function() {

      });

    it('should return a list of individual resources.',
      function() {

      });

    it('should return a list with a $promise and a $resolved property.',
      function() {

      });

    it('should asynchronously resolve the configuration list',
      function() {

      });

    it('should permit programmatically adding a configuration',
      function() {

      });

    it('should automatically select an initial configuration to use, if a list resolves',
      function() {

      });

    it('should not select a configuration to use, if no list resolves',
      function() {

      });

    it('should persist a selected configuration state',
      function() {

      });

    it('should reselect a configuration if that configuration is no longer available',
      function() {

      });
  });
/**
 * Unit tests for openstack's cloud $$configuration loader, behavior checks for autodetection.
 */
describe('Unit: OpenStack $$configuration autodetect',
  function() {
    'use strict';

    // Load the openstack module.
    beforeEach(module('openstack'));

    it('should permit the addition of services',
      function() {

      });

    it('should autodetect services',
      function() {

      });

    it('should include the "autodetect" resource in the query response, if valid.',
      function() {

      });

    it('should return an "autodetect" resource with a $promise and a $resolved field.',
      function() {

      });

    it('should still resolve if one of the autodetect services fails',
      function() {

      });

    it('should resolve a configuration named "autodetect"',
      function() {

      });

    it('should not resolve a configuration if all autodetect methods fail',
      function() {

      });

    it('should not include the "autodetect" resource in the query response,' +
      ' if it fails.',
      function() {

      });

    it('should return an object with a $promise and a $resolved flag',
      function() {

      });

    it('should properly update the $resolved flag when all autodetects complete',
      function() {

      });

    it('should fail its promise if all autodetects fail.',
      function() {

      });

    it('should pass its promise if some autodetects pass.',
      function() {

      });

    it('should return itself via its own promise.',
      function() {

      });
  });

/**
 * Unit tests for openstack's cloud $$configuration loader, behavior check without autodetect.
 */
describe('Unit: OpenStack $$configuration without autodetect',
  function() {
    'use strict';

    // We are testing the openstack module.
    beforeEach(module('openstack'));

    it('should permit the addition of autodetect services',
      function() {

      });

    it('should not execute autodetect checks',
      function() {

      });

    it('should not return an "autodetect" configuration in the query response',
      function() {

      });
  });

/**
 * Unit tests for openstack's cloud $$configuration loader, behavior checks for config.json loading.
 */
describe('Unit: OpenStack $$configuration autoload',
  function() {
    'use strict';

    // Load the openstack module.
    beforeEach(module('openstack'));

    it('should load the config.json file',
      function() {

      });

    it('should asynchronously resolve a resource expected in the config.json file.',
      function() {

      });

    it('should return all config.json configs with $promise and $resolved.',
      function() {

      });

    it('should automatically resolve the selected configuration if expected from config.json.',
      function() {

      });

    it('should asynchronously reject a resource expected, but not found, in config.json',
      function() {

      });
  });

/**
 * Unit tests for openstack's cloud $$configuration loader, behavior checks for disabled config.json
 * loading.
 */
describe('Unit: OpenStack $$configuration autoload (disabled)',
  function() {
    'use strict';

    // Load the openstack module.
    beforeEach(module('openstack'));

    it('should not load the config.json file',
      function() {

      });
  });

/**
 * Unit tests for openstack's cloud $$configuration loader, behavior checks for user custom
 * configurations.
 */
describe('Unit: OpenStack $$configuration userconfig',
  function() {
    'use strict';

    // Load the openstack module.
    beforeEach(module('openstack'));

    it('should permit the addition of a configuration at runtime.',
      function() {

      });

    it('should persist a user added configuration.',
      function() {

      });

    it('should permit the selection of a user-added configuration',
      function() {

      });

    it('should automatically select a user-added configuration at boot',
      function() {

      });

    it('should permit the removal of a user-added configuration.',
      function() {

      });
  });

/**
 * Unit tests for openstack's cloud $$configuration loader, behavior checks for user custom
 * configurations.
 */
describe('Unit: OpenStack $$configuration userconfig disabled',
  function() {
    'use strict';

    // Load the openstack module.
    beforeEach(module('openstack'));

    it('should not permit the addition of a configuration at runtime.',
      function() {

      });

    it('should not load user-added configurations from previous runs.',
      function() {

      });

    it('should not permit the selection of a user-added configuration',
      function() {

      });

    it('should clear the selection state of a user-added configuration',
      function() {

      });

    it('should permit the removal of a user-added configuration.',
      function() {

      });
  });
