/**
 * Unit tests for ironic's HTTP interceptors.
 */
describe('Unit: OpenStack Ironic API Transformation Methods',
  function() {
    'use strict';

    var ironicApiInterceptor;

    // We are testing the ironic.api module.
    beforeEach(module('ironic.api'));
    beforeEach(inject(function($injector) {
      ironicApiInterceptor = $injector.get('ironicApiInterceptor');
    }));

    /**
     * A dummy response body for a valid object.
     */
    var objectResponse = {
      uuid: 'foo'
    };

    /**
     * A dummy response object for a valid list of objects.
     */
    var listResponse = {
      resourceName: [
        angular.copy(objectResponse)
      ]
    };

    /**
     * A dummy error response.
     */
    var errorResponse = {
      error_message: {
        debuginfo: null,
        faultcode: 'Client',
        faultstring: 'Test fault string'
      }
    };
    var encodedErrorResponse = angular.copy(errorResponse);
    encodedErrorResponse.error_message = angular.toJson(encodedErrorResponse.error_message);

    /**
     * Run all changes through the filter chain.
     *
     * @param {String} resourceName The name of the resource to resolve.
     * @param {*} body The response data body to modify.
     * @param {int} status The HTTP status code to return.
     * @return {*} The modified body.
     */
    function applyResponseTransformationChain (resourceName, body, status) {
      status = status || 200;
      var transformers = ironicApiInterceptor.response(resourceName);
      for (var i = 0; i < transformers.length; i++) {
        var transformer = transformers[i];
        body = transformer(body, function() {
        }, status);
      }
      return body;
    }

    it('should transform a regular object response',
      function() {
        var result = applyResponseTransformationChain(
          null,
          angular.toJson(objectResponse),
          200
        );
        expect(result).toEqual(objectResponse);
      });

    it('should transform an object error response (twice)',
      function() {
        var result = applyResponseTransformationChain(
          null,
          angular.toJson(encodedErrorResponse),
          400
        );
        expect(result).toEqual(errorResponse);
      });

    it('should transform a correct list response',
      function() {
        var result = applyResponseTransformationChain(
          'resourceName',
          angular.toJson(listResponse),
          200
        );
        expect(result).toEqual(listResponse.resourceName);
      });

    it('should transform an error list response (twice)',
      function() {
        var result = applyResponseTransformationChain(
          'resourceName',
          angular.toJson(encodedErrorResponse),
          400
        );
        expect(result).toEqual(errorResponse);
      });
  });
