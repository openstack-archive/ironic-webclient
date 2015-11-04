/*
 * Copyright (c) 2015 Hewlett Packard Enterprise Development Company, L.P.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License'); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

/**
 * Logic that needs to be applied to every request against the Ironic API. Includes result
 * transformation and other things.
 */
angular.module('ironic.api').service('ironicApiInterceptor',
  function($q, $http) {

    /**
     * Ironic's error message is a doubly-encoded JSON string. This checks the body for that
     * field and runs a second decoder.
     *
     * @param responseBody The decoded JSON response body.
     * @param headers Headers getter.
     * @param status The HTTP Status of the response.
     * @returns {*} The decoded response body.
     */
    function parseErrorResponse (responseBody, headers, status) {
      if (400 <= status && responseBody.hasOwnProperty('error_message')) {
        responseBody.error_message = angular.fromJson(responseBody.error_message);
      }
      return responseBody;
    }

    /**
     * In some cases (as with list responses), we need to return the content of a child property
     * of the returned body rather than the whole response. This method returns a transformation
     * function that applies this change.
     *
     * @param propertyName The property name to reduce to.
     * @returns {Function} A function that reduces the response appropriately.
     */
    function parseChildProperty (propertyName) {
      /**
       * Response transformer for a specific ironic list response. If the property is not found
       * (As with error responses), simply returns the original object.
       *
       * @param responseBody The body received from the server.
       * @returns {Array} List of results.
       */
      return function(responseBody) {
        if (responseBody.hasOwnProperty(propertyName)) {
          return responseBody[propertyName];
        }
        return responseBody;
      };
    }

    return {
      /**
       * Transform the result of an object query from the Ironic API, accommodating for error
       * and list responses.
       *
       * @param childPropertyName (optional) The name of the child property to reduce to.
       * @returns {Array} An array of transformations.
       */
      'response': function(childPropertyName) {
        var transformers = $http.defaults.transformResponse.concat([]);
        transformers.push(parseErrorResponse);

        if (childPropertyName) {
          transformers.push(parseChildProperty(childPropertyName));
        }

        return transformers;
      }
    };
  });
