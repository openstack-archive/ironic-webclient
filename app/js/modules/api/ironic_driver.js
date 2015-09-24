/*
 * Copyright (c) 2015 Hewlett-Packard Development Company, L.P.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

/**
 * IronicDriver is an ngResource abstraction, which switches which Ironic it talks to based on the
 * selected cloud configuration provided by the $$configuration service. It may be used as if it
 * was an ngResource instance, and supports the methods `query`, `create`, `read`, `update`, and
 * `destroy`.
 */
angular.module('ironic.api').factory('IronicDriver',
  function($$configuration, $$resourceCache, $resource, $log) {

    /**
     * Builds an ngResource instance that talks to the Ironic Driver API.
     *
     * @param url Raw endpoint for the url.
     * @returns {*} An ng resource instance for the given url.
     */
    function buildResource (url) {
      $log.debug("Creating new IronicDriver at: " + url);
      return $resource(url, {'uuid': '@uuid'}, {
        'query': {
          'method': 'GET',
          'isArray': true,
          'transformResponse': function(data) {
            var parsed = angular.fromJson(data);
            return parsed.drivers;
          }
        },
        'create': {
          'method': 'POST'
        },
        'read': {
          'method': 'GET'
        },
        'update': {
          'method': 'PUT'
        },
        'delete': {
          'method': 'DELETE'
        }
      });
    }

    /**
     * This method extracts the current active API root URI from $$configuration, ensures that
     * the appropriate Ironic resources exists in the $$resourceCache, and returns it.
     */
    function getResource () {
      var baseUri = $$configuration.getApiBase('ironic');

      // Construct the resource URI.
      var resourceUrl = new URL(baseUri + '/drivers/:uuid');
      resourceUrl.pathname = resourceUrl.pathname.replace('//', '/');
      var resourceUri = resourceUrl.toString();

      if (!$$resourceCache.has(resourceUri)) {
        $$resourceCache.set(resourceUri, buildResource(resourceUri));
      }
      return $$resourceCache.get(resourceUri);
    }

    return {
      'query': function() {
        var r = getResource();
        return r.query.apply(r, arguments);
      },
      'create': function() {
        var r = getResource();
        return r.create.apply(r, arguments);
      },
      'read': function() {
        var r = getResource();
        return r.read.apply(r, arguments);
      },
      'update': function() {
        var r = getResource();
        return r.update.apply(r, arguments);
      },
      'destroy': function() {
        var r = getResource();
        return r.delete.apply(r, arguments);
      }
    };
  });

