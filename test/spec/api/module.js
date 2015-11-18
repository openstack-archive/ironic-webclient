/**
 * Unit tests for the ironic api module.
 */
describe('Unit: Ironic.API Module',
  function() {
    'use strict';

    var $rootScope;

    beforeEach(module('ironic.api'));
    beforeEach(module(function($$configurationProvider) {
      $$configurationProvider.$enableDefault(true);
    }));
    beforeEach(inject(function($injector) {
      $rootScope = $injector.get('$rootScope');
    }));

    it('should exist', function() {
      expect(angular.module('ironic.api')).toBeTruthy();
    });

    it('should automatically register a root API endpoint with $$configuration',
      inject(function($$configuration) {
        var config = $$configuration.read('default');
        $rootScope.$apply();

        expect(config.id).toBe('default');
        expect(config.ironic).toBeDefined();
        expect(config.ironic.apiRoot).toBeDefined();

        // Localhost is where we're running these tests.
        expect(config.ironic.apiRoot).toBe('http://localhost:6385');
      })
    );
  });
