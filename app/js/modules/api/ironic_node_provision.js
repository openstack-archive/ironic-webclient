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
 * This resource handles node provision state transitions. It only exposes the $update (PUT) method,
 * as that's the only real valid action that can be taken. This service does not validate a
 * change which a user/script may want to take.
 */
angular.module('ironic.api').factory('IronicNodeProvision',
  function($log, $$selectedConfiguration, $$resourceCache, $resource, $$dummyResource,
           ironicApiInterceptor, ironicApiVersion) {
    'use strict';

    /**
     * This method extracts the current active API root URI from $$configuration, ensures that
     * the appropriate Ironic resources exists in the $$resourceCache, and returns it.
     *
     * @returns {{}} The created, and cached, IronicPort resource.
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
      var nodeUrl = ironicApiRoot + '/nodes/:node_ident/states/provision';

      if (!$$resourceCache.has(nodeUrl)) {
        $log.debug("Creating new IronicNodeProvision at: " + nodeUrl);
        var resource = $resource(nodeUrl, {'node_ident': '@node_ident'}, {
          'update': {
            'method': 'PUT',
            'headers': {
              'X-OpenStack-Ironic-API-Version': ironicApiVersion
            },
            'transformResponse': ironicApiInterceptor.response()
          }
        });

        $$resourceCache.set(nodeUrl, resource);
      }

      return $$resourceCache.get(nodeUrl);
    }

    return {
      'update': function() {
        var r = getResource();
        return r.update.apply(r, arguments);
      }
    };
  });
