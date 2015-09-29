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
    var currentConfiguration, selectingConfiguration;

    return {
      /**
       * Retrieve the currently active configuration. If there is not configuration selected,
       * this resources' $promise will fail.
       *
       * @returns {*} The configuration.
       */
      'get': function() {
        // If we're in the process of selecting one, return that.
        if (selectingConfiguration) {
          return selectingConfiguration;
        }

        // If we have a current one, return that.
        if (currentConfiguration) {
          return currentConfiguration;
        }

        // Return the 'selected' configuration by setting it.
        return this.set($$persistentStorage.get(storageKey));
      },

      /**
       * Set a particular configuration as active. The selection will only be persisted to
       * LocalStorage if the selected configuration is valid and available in the
       * $$configuration list.
       *
       * @param configurationId The configuration to activate.
       * @returns {*} The active configuration.
       */
      'set': function(configurationId) {
        // Normalize input

        if (angular.isObject(configurationId)) {
          configurationId = configurationId.id || null;
        }

        // If we're in a resolved state and the ID's match...
        if (currentConfiguration && currentConfiguration.id === configurationId) {
          return currentConfiguration;
        }

        // If we're in a resolving state and the ID's match...
        if (selectingConfiguration && selectingConfiguration.id === configurationId) {
          return selectingConfiguration;
        }

        // If we've reached this point, we need to resolve a new configuration.
        selectingConfiguration = $$configuration.read(configurationId);
        selectingConfiguration.$promise.then(
          function() {
            // Only set this if the promise resolves sucessfully.
            $$persistentStorage.set(storageKey, configurationId);
            currentConfiguration = selectingConfiguration;
          },
          function() {
            // if setting fails, clear the existing storage key if it matches. This case occurs
            // if the system initializes with a config ID that has been invalidated since the
            // previous run.
            if ($$persistentStorage.get(storageKey) === configurationId) {
              $$persistentStorage.remove(storageKey);
            }
          }
        ).finally(
          function() {
            // clear the selecting configuration
            selectingConfiguration = null;
          });

        return selectingConfiguration;
      }
    };
  });
