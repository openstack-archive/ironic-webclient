/*
 * Copyright (c) 2015 Hewlett-Packard Development Company, L.P.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

/**
 * The $$selectedConfiguration service provides a way of easily accessing, and modifying,
 * the current active cloud configuration used in an application. It will resolve configurations
 * from the $$configuration provider, which provides multiple configuration loading mechanisms.
 */
angular.module('openstack').service('$$selectedConfiguration',
  function($$persistentStorage, $$configuration) {
    'use strict';

    var storageKey = '$$selectedConfiguration';

    return {
      /**
       * Retrieve the currently active configuration. If there is not configuration selected,
       * this resources' $promise will fail.
       *
       * @returns {*} The configuration.
       */
      'get': function() {
        var id = $$persistentStorage.get(storageKey) || null;

        var config = $$configuration.read(id);
        config.$promise.then(function() {
          // Nothing to do here.
        }, function() {
          // Resolution failed from the persistent id, so remove it.
          $$persistentStorage.remove(storageKey);
        });
        return config;
      },

      /**
       * Set a particular configuration as active. The selection will only be persisted to
       * LocalStorage if the selected configuration is valid and available in the
       * $$configuration list.
       *
       * @param configuration The configuration to activate.
       * @returns {*} The active configuration.
       */
      'set': function(configuration) {
        if (angular.isString(configuration)) {
          configuration = {id: configuration};
        }
        var config = $$configuration.read(configuration.id);
        config.$promise.then(function(resolved) {
          // Only set this if the promise resolves sucessfully.
          $$persistentStorage.set(storageKey, resolved.id);
        });
        return config;
      }
    };
  });
