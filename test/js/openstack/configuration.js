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

        var destroyResult = $$configuration.destroy(testId);
        $rootScope.$apply();
        expect(destroyResult.$promise.$$state.status).toEqual(2);
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

        var destroyResult = config.$destroy();
        $rootScope.$apply();
        expect(destroyResult.$promise.$$state.status).toEqual(2);
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

        var destroyResult = config.$destroy();
        $rootScope.$apply();
        expect(destroyResult.$promise.$$state.status).toEqual(2);
      }));
  });

/**
 * Unit tests for openstack's cloud $$configuration loader, using config loading.
 */
describe('Unit: OpenStack $$configuration, configuration loading',
  function() {
    'use strict';

    //var $httpBackend;
    //
    //// Load the openstack module.
    //beforeEach(module('openstack'));
    //
    //beforeEach(inject(function($injector) {
    //  // Set up the mock http service
    //  $httpBackend = $injector.get('$httpBackend');
    //}));
    //
    //afterEach(function() {
    //  // Assert no outstanding HTTP requests.
    //  $httpBackend.verifyNoOutstandingExpectation();
    //  $httpBackend.verifyNoOutstandingRequest();
    //});
    //
    //it('should permit the addition of autodetect services',
    //  function() {
    //
    //  });
    //
    //it('should not execute autodetect checks',
    //  function() {
    //
    //  });
    //
    //it('should not return an "autodetect" configuration in the query response',
    //  function() {
    //
    //  });
  });

/**
 * Unit tests for openstack's cloud $$configuration loader, behavior checks for config.json loading.
 */
describe('Unit: OpenStack $$configuration, local storage',
  function() {
    'use strict';

    //var $httpBackend;
    //var testConfig = [
    //  {
    //    id: 'testConfig1',
    //    ironic: [{}]
    //  },
    //  {
    //    id: 'testConfig2',
    //    nova: [{}]
    //  }
    //];
    //
    //// Load the openstack module.
    //beforeEach(module('openstack'));
    //
    //beforeEach(inject(function($injector) {
    //  // Set up the mock http service
    //  $httpBackend = $injector.get('$httpBackend');
    //}));
    //
    //afterEach(function() {
    //  // Assert no outstanding HTTP requests.
    //  $httpBackend.verifyNoOutstandingExpectation();
    //  $httpBackend.verifyNoOutstandingRequest();
    //});
    //
    //it('should load the config.json file',
    //  inject(function($$configuration) {
    //    $httpBackend
    //      .expect('GET', 'config.json')
    //      .respond(testConfig);
    //
    //    var results = $$configuration.query({});
    //    $httpBackend.flush();
    //    expect(results).toEqual(testConfig);
    //  }));
    //
    //it('should asynchronously resolve a resource expected in the config.json file.',
    //  inject(function($$configuration) {
    //    $httpBackend
    //      .expect('GET', 'config.json')
    //      .respond(testConfig);
    //
    //    var testConfig2 = $$configuration.get({id: 'testConfig2'});
    //    $httpBackend.flush();
    //    expect(testConfig2).toEqual(testConfig[1]);
    //  }));
    //
    //it('should return all config.json configs with $promise and $resolved.',
    //  inject(function($$configuration) {
    //    $httpBackend
    //      .expect('GET', 'config.json')
    //      .respond(testConfig);
    //
    //    var results = $$configuration.query({});
    //    expect(results.$promise).toBeDefined();
    //    expect(results.$resolved).toBeFalsy();
    //    $httpBackend.flush();
    //    expect(results.$resolved).toBeTruthy();
    //    expect(results.length).toEqual(2);
    //    for (var i = 0; i < results.length; i++) {
    //      expect(results[i].$promise).toBeDefined();
    //      expect(results[i].$resolved).toBeTruthy();
    //    }
    //  }));
    //
    //it('should automatically resolve the selected configuration if expected from config.json.',
    //  inject(function($$configuration, $$persistentStorage) {
    //    // Preload a 'selected' id.
    //    $$persistentStorage.set('$$configuration.selected', 'testConfig2');
    //    $httpBackend
    //      .expect('GET', 'config.json')
    //      .respond(testConfig);
    //
    //    var results = $$configuration.query({});
    //    expect(results.$promise).toBeDefined();
    //    expect(results.$resolved).toBeFalsy();
    //    $httpBackend.flush();
    //    expect(results.$resolved).toBeTruthy();
    //    expect(results.length).toEqual(2);
    //    for (var i = 0; i < results.length; i++) {
    //      expect(results[i].$promise).toBeDefined();
    //      expect(results[i].$resolved).toBeTruthy();
    //    }
    //  }));
    //
    //it('should asynchronously reject a resource expected, but not found, in config.json',
    //  function() {
    //
    //  });
  });
