/**
 * Unit tests for openstack's cloud $$configuration resource.
 */
describe('Unit: OpenStack $$configuration, basic operation',
  function() {
    'use strict';

    var $httpBackend, $rootScope, $$configProvider;
    var testConfig1 = {
      'id': 'testConfig1',
      'ironic': {
        'apiRoot': 'http://example.com:6385'
      }
    };
    var testConfig2 = {
      'id': 'testConfig2',
      'ironic': {
        'apiRoot': 'http://ironic.example.com:6385'
      }
    };
    // Load the openstack module.
    beforeEach(module('openstack'));

    beforeEach(module(function($$configurationProvider) {
      // Store this for later use.
      $$configProvider = $$configurationProvider;

      // Make sure all autoloaders are disabled.
      $$configProvider.$enableLocalStorage(false);
      $$configProvider.$enableDefault(false);
      $$configProvider.$enableConfigLoad(false);
    }));

    beforeEach(inject(function($injector) {
      // Set up the mock http service
      $httpBackend = $injector.get('$httpBackend');
      $rootScope = $injector.get('$rootScope');
    }));

    afterEach(function() {
      // Assert no outstanding HTTP requests.
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should exist',
      inject(function($$configuration) {
        expect($$configuration).toBeTruthy();
      }));

    it('should return a list of individual resources.',
      inject(function($$configuration) {
        var results = $$configuration.query({});
        expect(results).toEqual(jasmine.any(Array));
        expect(results.length).toEqual(0);
        expect(results.$promise).toBeDefined();
        expect(results.$resolved).toBeDefined();
        expect(results.$resolved).toBeFalsy();
      }));

    it('should asynchronously resolve the configuration list',
      inject(function($$configuration) {
        // Load a config.
        $$configProvider.$addConfig(testConfig1);

        var results = $$configuration.query({});
        expect(results.$promise).toBeDefined();
        expect(results.$resolved).toBeFalsy();
        $rootScope.$apply();
        expect(results.$resolved).toBeTruthy();
        expect(results.length).toEqual(1);
        expect(results[0].id).toBe(testConfig1.id);
      }));

    it('should permit programmatically adding a configuration',
      inject(function($$configuration) {
        // Load a config.
        $$configProvider.$addConfig(testConfig1);

        var results = $$configuration.query({});
        $rootScope.$apply();
        expect(results.$resolved).toBeTruthy();
        expect(results.length).toEqual(1);
        expect(results[0].id).toBe(testConfig1.id);

        $$configProvider.$addConfig(testConfig2);

        var results2 = $$configuration.query({});
        $rootScope.$apply();
        expect(results2.$resolved).toBeTruthy();
        expect(results2.length).toEqual(2);
        expect(results2[0].id).toBe(testConfig1.id);
        expect(results2[1].id).toBe(testConfig2.id);
      }));

    it('should loading static configurations by ID',
      inject(function($$configuration) {
        // Load a config.
        $$configProvider.$addConfig(testConfig1);

        var testId = 'testConfig1';
        var config = $$configuration.read(testId);
        expect(config.$promise).toBeDefined();
        expect(config.$resolved).toBeFalsy();
        expect(config.id).toEqual(testId);
        $rootScope.$apply();
        expect(config.$resolved).toBeTruthy();
        expect(config.ironic).toEqual(testConfig1.ironic);
      }));

    it('should fail loading invalid ID\'s',
      inject(function($$configuration) {
        // Load a config.
        $$configProvider.$addConfig(testConfig1);

        var testId = 'invalidId';
        var config = $$configuration.read(testId);
        expect(config.$promise).toBeDefined();
        expect(config.$resolved).toBeFalsy();
        expect(config.id).toEqual(testId);

        var rejectCalled = false;
        var resolveCalled = false;
        config.$promise.then(function() {
          resolveCalled = true;
        }, function() {
          rejectCalled = true;
        });

        $rootScope.$apply();
        expect(config.$resolved).toBeTruthy();
        expect(rejectCalled).toEqual(true);
        expect(resolveCalled).toEqual(false);
      }));

    it('should fail loading empty ID\'s',
      inject(function($$configuration) {
        // Load a config.
        $$configProvider.$addConfig(testConfig1);

        var testId = null;
        var config = $$configuration.read(testId);
        expect(config.$promise).toBeDefined();
        expect(config.$resolved).toBeFalsy();
        expect(config.id).toEqual(testId);

        var rejectCalled = false;
        var resolveCalled = false;
        config.$promise.then(function() {
          resolveCalled = true;
        }, function() {
          rejectCalled = true;
        });

        $rootScope.$apply();
        expect(config.$resolved).toBeTruthy();
        expect(rejectCalled).toEqual(true);
        expect(resolveCalled).toEqual(false);
      }));

    it('should only permit Read operations for static configurations',
      inject(function($$configuration) {
        // Load a config.
        $$configProvider.$addConfig(testConfig1);

        var testId = 'testConfig1';
        var config = $$configuration.read(testId);
        $rootScope.$apply();
        expect(config.id).toEqual(testId);

        var createResult = $$configuration.create({'id': 'pixie'});
        $rootScope.$apply();
        expect(createResult.$promise.$$state.status).toEqual(2);

        var readResult = $$configuration.read(testId);
        $rootScope.$apply();
        expect(readResult.$promise.$$state.status).toEqual(1);

        var updateResult = $$configuration.update(config);
        $rootScope.$apply();
        expect(updateResult.$promise.$$state.status).toEqual(2);

        var removeResult = $$configuration.remove(testId);
        $rootScope.$apply();
        expect(removeResult.$promise.$$state.status).toEqual(2);
      }));

    it('should only permit Read operations via the instance convenience methods',
      inject(function($$configuration) {
        // Load a config.
        $$configProvider.$addConfig(testConfig1);

        var testId = 'testConfig1';
        var config = $$configuration.read(testId);
        $rootScope.$apply();
        expect(config.id).toEqual(testId);

        var createResult = config.$create();
        $rootScope.$apply();
        expect(createResult.$promise.$$state.status).toEqual(2);

        var readResult = config.$read();
        $rootScope.$apply();
        expect(readResult.$promise.$$state.status).toEqual(1);

        var updateResult = config.$update();
        $rootScope.$apply();
        expect(updateResult.$promise.$$state.status).toEqual(2);

        var removeResult = config.$remove();
        $rootScope.$apply();
        expect(removeResult.$promise.$$state.status).toEqual(2);
      }));
  });

/**
 * Unit tests for openstack's cloud $$configuration loader, using default injection.
 */
describe('Unit: OpenStack $$configuration, default management',
  function() {
    'use strict';

    var $httpBackend, $rootScope, $$configProvider;
    var testConfig1 = {
      'id': 'testConfig1',
      'ironic': {
        'apiRoot': 'http://example.com:6385'
      }
    };
    // Load the openstack module.
    beforeEach(module('openstack'));
    beforeEach(module(function($$configurationProvider) {
      // Store this for later use.
      $$configProvider = $$configurationProvider;

      // Make sure all autoloaders are disabled.
      $$configProvider.$enableLocalStorage(false);
      $$configProvider.$enableDefault(true);
      $$configProvider.$enableConfigLoad(false);
    }));

    beforeEach(inject(function($injector) {
      // Set up the mock http service
      $httpBackend = $injector.get('$httpBackend');
      $rootScope = $injector.get('$rootScope');
    }));

    afterEach(function() {
      // Assert no outstanding HTTP requests.
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should permit the registration of services',
      inject(function($$configuration) {
        $$configProvider.$registerDefault('ironic', 'http://example.com:9999');
        $$configProvider.$registerDefault('glance', 'http://example.com:9998');

        var results = $$configuration.query({});
        $rootScope.$apply();
        expect(results.$resolved).toBeTruthy();
        expect(results.length).toEqual(1);
        expect(results[0].id).toBe('default');
        expect(results[0].ironic.apiRoot).toEqual('http://example.com:9999');
        expect(results[0].glance.apiRoot).toEqual('http://example.com:9998');
      }));

    it('should permit retrieving the default config',
      inject(function($$configuration) {
        $$configProvider.$registerDefault('ironic', 'http://example.com:9999');
        $$configProvider.$registerDefault('glance', 'http://example.com:9998');

        var config = $$configuration.read('default');
        $rootScope.$apply();
        expect(config.$promise.$$state.status).toEqual(1);
        expect(config.$resolved).toBeTruthy();
        expect(config.id).toBe('default');
        expect(config.ironic.apiRoot).toEqual('http://example.com:9999');
        expect(config.glance.apiRoot).toEqual('http://example.com:9998');
      }));

    it('should permit dynamically adding new defaults',
      inject(function($$configuration) {
        $$configProvider.$registerDefault('ironic', 'http://example.com:9999');

        var config = $$configuration.read('default');
        $rootScope.$apply();
        expect(config.$promise.$$state.status).toEqual(1);
        expect(config.$resolved).toBeTruthy();
        expect(config.id).toBe('default');
        expect(config.ironic.apiRoot).toEqual('http://example.com:9999');
        expect(config.glance).toBeUndefined();

        $$configProvider.$registerDefault('glance', 'http://example.com:9998');
        var newConfig = $$configuration.read('default');
        $rootScope.$apply();
        expect(newConfig.$promise.$$state.status).toEqual(1);
        expect(newConfig.$resolved).toBeTruthy();
        expect(newConfig.id).toBe('default');
        expect(newConfig.ironic.apiRoot).toEqual('http://example.com:9999');
        expect(newConfig.glance.apiRoot).toEqual('http://example.com:9998');
      }));

    it('should permit toggling the enabled flag',
      inject(function($$configuration) {
        $$configProvider.$registerDefault('ironic', 'http://example.com:9999');

        var configOne = $$configuration.read('default');
        $rootScope.$apply();
        expect(configOne.$promise.$$state.status).toEqual(1);
        expect(configOne.$resolved).toBeTruthy();
        expect(configOne.id).toBe('default');
        expect(configOne.ironic.apiRoot).toEqual('http://example.com:9999');

        $$configProvider.$enableDefault(false);
        var configTwo = $$configuration.read('default');
        $rootScope.$apply();
        expect(configTwo.$promise.$$state.status).toEqual(2);
        expect(configTwo.$resolved).toBeTruthy();
        expect(configTwo.id).toBe('default');
        expect(configTwo.ironic).toBeUndefined();

        $$configProvider.$enableDefault(true);
        var configThree = $$configuration.read('default');
        $rootScope.$apply();
        expect(configThree.$promise.$$state.status).toEqual(1);
        expect(configThree.$resolved).toBeTruthy();
        expect(configThree.id).toBe('default');
        expect(configThree.ironic.apiRoot).toEqual('http://example.com:9999');
      }));

    it('should not permit api-based modification of the default config',
      inject(function($$configuration) {
        $$configProvider.$registerDefault('ironic', 'http://example.com:9999');

        var config = $$configuration.read('default');
        $rootScope.$apply();

        var createResult = config.$create();
        $rootScope.$apply();
        expect(createResult.$promise.$$state.status).toEqual(2);

        var updateResult = config.$update();
        $rootScope.$apply();
        expect(updateResult.$promise.$$state.status).toEqual(2);

        var removeResult = config.$remove();
        $rootScope.$apply();
        expect(removeResult.$promise.$$state.status).toEqual(2);
      }));
  });

/**
 * Unit tests for openstack's cloud $$configuration loader, using config loading.
 */
describe('Unit: OpenStack $$configuration, configuration loading',
  function() {
    'use strict';

    var $httpBackend, $rootScope, $$configProvider;
    var testConfigFile = [{
      'id': 'configFile',
      'ironic': {
        'apiRoot': 'http://example.com:6385'
      }
    }];
    // Load the openstack module.
    beforeEach(module('openstack'));
    beforeEach(module(function($$configurationProvider) {
      // Store this for later use.
      $$configProvider = $$configurationProvider;

      // Make sure only configload is enabled.
      $$configProvider.$enableLocalStorage(false);
      $$configProvider.$enableDefault(false);
      $$configProvider.$enableConfigLoad(true);
    }));
    beforeEach(inject(function($injector) {
      // Set up the mock http service
      $httpBackend = $injector.get('$httpBackend');
      $rootScope = $injector.get('$rootScope');
    }));
    afterEach(function() {
      // Assert no outstanding HTTP requests.
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should load the config.json file into a list',
      inject(function($$configuration) {
        $httpBackend
          .expect('GET', './config.json')
          .respond(testConfigFile);

        var results = $$configuration.query({});
        expect(results).toEqual(jasmine.any(Array));
        expect(results.$promise).toBeDefined();
        expect(results.$resolved).toBeFalsy();
        expect(results.length).toBe(0);
        $httpBackend.flush();
        expect(results.$resolved).toBeTruthy();
        expect(results.length).toBe(1);
        expect(results[0].id).toEqual(testConfigFile[0].id);
      }));

    it('should asynchronously resolve a resource expected from the config.json file.',
      inject(function($$configuration) {
        $httpBackend
          .expect('GET', './config.json')
          .respond(testConfigFile);

        var fileConfig = $$configuration.read('configFile');
        expect(fileConfig).toEqual(jasmine.any(Object));
        expect(fileConfig.$promise).toBeDefined();
        expect(fileConfig.$resolved).toBeFalsy();
        $httpBackend.flush();
        expect(fileConfig.$resolved).toBeTruthy();
        expect(fileConfig.id).toBe(testConfigFile[0].id);
      }));

    it('should only request config.json once with subsequent requests',
      inject(function($$configuration) {
        // Expect both a before and an after load.
        $httpBackend
          .expect('GET', './config.json')
          .respond(testConfigFile);

        var testId = 'configFile';
        var configOne = $$configuration.read(testId);
        $httpBackend.flush();
        expect(configOne.$promise.$$state.status).toEqual(1);
        expect(configOne.$resolved).toBeTruthy();
        expect(configOne.id).toBe(testId);
        expect(configOne.ironic).toBeDefined();

        var configTwo = $$configuration.read(testId);
        $rootScope.$apply();
        expect(configTwo.$promise.$$state.status).toEqual(1);
        expect(configTwo.$resolved).toBeTruthy();
        expect(configTwo.id).toBe(testId);
        expect(configOne.ironic).toBeDefined();
      }));

    it('should not error when ./config.json does not exist',
      inject(function($$configuration) {
        // Expect both a before and an after load.
        $httpBackend
          .expect('GET', './config.json')
          .respond(404, '');

        var configList = $$configuration.query({});
        $httpBackend.flush();
        expect(configList.$resolved).toBeTruthy();
        expect(configList.$promise.$$state.status).toEqual(1);
        expect(configList.length).toEqual(0);
      }));

    it('should not error when ./config.json is empty',
      inject(function($$configuration) {
        // Expect both a before and an after load.
        $httpBackend
          .expect('GET', './config.json')
          .respond(200, '');

        var configList = $$configuration.query({});
        $httpBackend.flush();
        expect(configList.$resolved).toBeTruthy();
        expect(configList.$promise.$$state.status).toEqual(1);
        expect(configList.length).toEqual(0);
      }));

    it('should not error when ./config.json is invalid json',
      inject(function($$configuration) {
        // Expect both a before and an after load.
        $httpBackend
          .expect('GET', './config.json')
          .respond(200, '[{"unterminated":');

        var configList = $$configuration.query({});
        $httpBackend.flush();
        expect(configList.$resolved).toBeTruthy();
        expect(configList.$promise.$$state.status).toEqual(1);
        expect(configList.length).toEqual(0);
      }));

    it('should not error when ./config.json is not an array',
      inject(function($$configuration) {
        // Expect both a before and an after load.
        $httpBackend
          .expect('GET', './config.json')
          .respond(200, '{}');

        var configList = $$configuration.query({});
        $httpBackend.flush();
        expect(configList.$resolved).toBeTruthy();
        expect(configList.$promise.$$state.status).toEqual(1);
        expect(configList.length).toEqual(0);
      }));

    it('should permit toggling the enabled flag',
      inject(function($$configuration) {
        // Expect both a before and an after load.
        $httpBackend
          .expect('GET', './config.json')
          .respond(testConfigFile);

        var testId = 'configFile';
        var configOne = $$configuration.read(testId);
        $httpBackend.flush();
        expect(configOne.$promise.$$state.status).toEqual(1);
        expect(configOne.$resolved).toBeTruthy();
        expect(configOne.id).toBe(testId);
        expect(configOne.ironic).toBeDefined();

        $$configProvider.$enableConfigLoad(false);
        var configTwo = $$configuration.read(testId);
        $rootScope.$apply();
        expect(configTwo.$promise.$$state.status).toEqual(2);
        expect(configTwo.$resolved).toBeTruthy();
        expect(configTwo.id).toBe(testId);
        expect(configTwo.ironic).toBeUndefined();

        // Expect a second request.
        $httpBackend
          .expect('GET', './config.json')
          .respond(testConfigFile);

        $$configProvider.$enableConfigLoad(true);
        var configThree = $$configuration.read(testId);
        $httpBackend.flush();
        expect(configThree.$promise.$$state.status).toEqual(1);
        expect(configThree.$resolved).toBeTruthy();
        expect(configThree.id).toBe(testId);
        expect(configThree.ironic).toBeDefined();
      }));

    it('should not permit api-based modification of file config',
      inject(function($$configuration) {
        // Expect both a before and an after load.
        $httpBackend
          .expect('GET', './config.json')
          .respond(testConfigFile);

        var config = $$configuration.read('configFile');
        $httpBackend.flush();

        var createResult = config.$create();
        $rootScope.$apply();
        expect(createResult.$promise.$$state.status).toEqual(2);

        var updateResult = config.$update();
        $rootScope.$apply();
        expect(updateResult.$promise.$$state.status).toEqual(2);

        var removeResult = config.$remove();
        $rootScope.$apply();
        expect(removeResult.$promise.$$state.status).toEqual(2);
      }));
  });

/**
 * Unit tests for openstack's cloud $$configuration loader, behavior checks for user-based
 * localStorage configurations.
 */
describe('Unit: OpenStack $$configuration, local storage',
  function() {
    'use strict';

    var $httpBackend, $rootScope, $$configProvider, $$persistentStorage, testConfig;
    var storageKey = '$$configuration';

    // Load the openstack module.
    beforeEach(module('openstack'));
    beforeEach(module(function($$configurationProvider) {
      // Store this for later use.
      $$configProvider = $$configurationProvider;

      // Make sure only localStorage is enabled.
      $$configProvider.$enableLocalStorage(true);
      $$configProvider.$enableDefault(false);
      $$configProvider.$enableConfigLoad(false);

      // Reset the testconfig
      testConfig = [{
        'id': 'localConfig1',
        'ironic': {
          'apiRoot': 'http://example.com:6385'
        }
      }, {
        'id': 'localConfig2',
        'ironic': {
          'apiRoot': 'http://ironic.example.com:6385'
        }
      }];
    }));
    beforeEach(inject(function($injector) {
      // Set up the mock http service
      $httpBackend = $injector.get('$httpBackend');
      $rootScope = $injector.get('$rootScope');
      $$persistentStorage = $injector.get('$$persistentStorage');
    }));
    afterEach(function() {
      // Assert no outstanding HTTP requests.
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();

      // Remove all
      $$persistentStorage.remove(storageKey);
    });

    it('should load configurations from $$persistentStorage',
      inject(function($$configuration) {
        $$persistentStorage.set(storageKey, testConfig);

        var results = $$configuration.query({});
        $rootScope.$apply();
        expect(results.$resolved).toBeTruthy();
        expect(results.length).toEqual(2);
        expect(results[0].id).toBe('localConfig1');
        expect(results[0].ironic.apiRoot).toEqual('http://example.com:6385');
      }));

    it('should not error if nothing is stored in $$persistentStorage',
      inject(function($$configuration) {
        $$persistentStorage.remove(storageKey);

        var results = $$configuration.query({});
        $rootScope.$apply();
        expect(results.$resolved).toBeTruthy();
        expect(results.length).toEqual(0);
      }));

    it('should permit toggling the enabled flag',
      inject(function($$configuration) {
        $$persistentStorage.set(storageKey, testConfig);

        var results1 = $$configuration.query({});
        $rootScope.$apply();
        expect(results1.$resolved).toBeTruthy();
        expect(results1.length).toEqual(2);

        $$configProvider.$enableLocalStorage(false);
        var results2 = $$configuration.query({});
        $rootScope.$apply();
        expect(results2.$resolved).toBeTruthy();
        expect(results2.length).toEqual(0);

        $$configProvider.$enableLocalStorage(true);
        var results3 = $$configuration.query({});
        $rootScope.$apply();
        expect(results3.$resolved).toBeTruthy();
        expect(results3.length).toEqual(2);
      }));

    it('should permit the creation of new configurations',
      inject(function($$configuration) {
        var result = $$configuration.create(angular.copy(testConfig[0]));
        expect(result.$resolved).toBeFalsy();
        $rootScope.$apply();
        expect(result.$resolved).toBeTruthy();
        expect(result.$promise.$$state.status).toEqual(1);
        expect($$persistentStorage.get(storageKey)).toEqual([testConfig[0]]);

        var getResult = $$configuration.read(testConfig[0].id);
        $rootScope.$apply();
        expect(getResult.id).toEqual(result.id);
        expect(getResult.$promise.$$state.status).toEqual(1);
      }));

    it('should not permit the creation of a configuration with a duplicate ID',
      inject(function($$configuration) {
        $$persistentStorage.set(storageKey, testConfig);

        var result = $$configuration.create(angular.copy(testConfig[1]));
        expect(result.$resolved).toBeFalsy();
        $rootScope.$apply();
        expect(result.$resolved).toBeTruthy();
        expect(result.$promise.$$state.status).toEqual(2);
      }));

    it('should not permit the creation of a configuration with no ID',
      inject(function($$configuration) {
        var result = $$configuration.create({});
        expect(result.$resolved).toBeFalsy();
        $rootScope.$apply();
        expect(result.$resolved).toBeTruthy();
        expect(result.$promise.$$state.status).toEqual(2);
      }));

    it('should permit modifying an existing configuration',
      inject(function($$configuration) {
        $$persistentStorage.set(storageKey, testConfig);

        var newApiRoot = 'https://example.com:6385';
        var modifiedConfig = angular.copy(testConfig[1]);
        modifiedConfig.ironic.apiRoot = newApiRoot;

        var result = $$configuration.update(modifiedConfig);
        expect(result.$resolved).toBeFalsy();
        $rootScope.$apply();
        expect(result.$resolved).toBeTruthy();
        expect(result.$promise.$$state.status).toEqual(1);
        expect(result.ironic.apiRoot).toEqual(newApiRoot);
        expect(result.ironic.apiRoot).not.toEqual(testConfig[1].ironic.apiRoot);
        expect($$persistentStorage.get(storageKey)[1].ironic.apiRoot).toEqual(newApiRoot);
      }));

    it('should permit deleting an existing configuration',
      inject(function($$configuration) {
        $$persistentStorage.set(storageKey, testConfig);

        var testId = 'localConfig2';
        var result = $$configuration.remove(testId);
        expect(result.$resolved).toBeFalsy();
        $rootScope.$apply();
        expect(result.$resolved).toBeTruthy();
        expect(result.$promise.$$state.status).toEqual(1);
        expect($$persistentStorage.get(storageKey)).toEqual([testConfig[0]]);
      }));

    it('should not permit updating a nonexistent configuration',
      inject(function($$configuration) {
        var result = $$configuration.update({id: 'invalidId'});
        expect(result.$resolved).toBeFalsy();
        $rootScope.$apply();
        expect(result.$resolved).toBeTruthy();
        expect(result.$promise.$$state.status).toEqual(2);
        expect($$persistentStorage.get(storageKey)).toBeUndefined();
      }));

    it('should not permit deleting a nonexistent configuration',
      inject(function($$configuration) {
        var result = $$configuration.remove('invalidId');
        expect(result.$resolved).toBeFalsy();
        $rootScope.$apply();
        expect(result.$resolved).toBeTruthy();
        expect(result.$promise.$$state.status).toEqual(2);
        expect($$persistentStorage.get(storageKey)).toBeUndefined();
      }));
  });
