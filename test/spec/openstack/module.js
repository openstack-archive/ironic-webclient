/**
 * Unit tests for the openstack module.
 */
describe('Unit: OpenStack Module',
  function () {
    'use strict';

    var module;

    beforeEach(function () {
      // Get module
      module = angular.module('openstack');
    });

    it('should exist', function () {
      expect(module).toBeTruthy();
    });
  });
