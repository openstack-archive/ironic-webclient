/**
 * Unit tests for the ironic api module.
 */
describe('Unit: Ironic.API Module',
  function () {
    'use strict';

    var module;

    beforeEach(function () {
      // Get module
      module = angular.module('ironic.api');
    });

    it('should exist', function () {
      expect(module).toBeTruthy();
    });
  });
