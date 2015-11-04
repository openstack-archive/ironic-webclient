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
 * `remove`.
 */
angular.module('ironic.api').factory('IronicDriver',
  function($log, $$selectedConfiguration, $$resourceCache, $resource, $$dummyResource,
           ironicApiInterceptor) {

    /**
     * This method extracts the current active API root URI from $$configuration, ensures that
     * the appropriate Ironic resources exists in the $$resourceCache, and returns it.
     */
    function getResource () {
      // Pull the current configuration.
      var currentConfig = $$selectedConfiguration.get();

      // This should resolve the API root, except in cases where the selected configuration is
      // invalid and/or has not yet been resolved.
      var ironicConfig = currentConfig.ironic || {};
      var ironicApiRoot = ironicConfig.apiRoot || null;

      if (!ironicApiRoot) {
        $log.warn('Ironic API Root for Config [' + currentConfig.id + '] not found.');
        return $$dummyResource;
      }

      // Build and/or retrieve a cached instance of the requested service.
      var driverUrl = ironicApiRoot + '/drivers/:uuid';

      if (!$$resourceCache.has(driverUrl)) {
        $log.debug("Creating new IronicDriver at: " + driverUrl);
        var resource = $resource(driverUrl, {'uuid': '@uuid'}, {
          'query': {
            'method': 'GET',
            'isArray': true,
            'transformResponse': ironicApiInterceptor.response('drivers')
          },
          'create': {
            'method': 'POST',
            'transformResponse': ironicApiInterceptor.response()
          },
          'read': {
            'method': 'GET',
            'transformResponse': ironicApiInterceptor.response()
          },
          'update': {
            'method': 'PUT',
            'transformResponse': ironicApiInterceptor.response()
          },
          'remove': {
            'method': 'DELETE',
            'transformResponse': ironicApiInterceptor.response()
          }
        });

        $$resourceCache.set(driverUrl, resource);
      }

      return $$resourceCache.get(driverUrl);
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
      'remove': function() {
        var r = getResource();
        return r.remove.apply(r, arguments);
      }
    };
  });
