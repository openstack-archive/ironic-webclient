/*
 * Copyright (c) 2015 Hewlett-Packard Development Company, L.P.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License'); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

/**
 * A convenience component that automatically selects the most secure, and most
 * persistent, storage mechanism available in the current runtime. This does
 * not include sessionStorage, which must be used independently.
 */
angular.module('openstack').factory('$$persistentStorage',
  function($log, $$cookieStorage, $$memoryStorage, $$localStorage) {
    'use strict';

    // Check for local storage.
    if ($$localStorage.isSupported()) {
      return $$localStorage;
    }

    // Check for cookie storage.
    if ($$cookieStorage.isSupported()) {
      return $$cookieStorage;
    }

    $log.warn('Warning: No persistent storage mechanism supported, all storage will be transient.');
    return $$memoryStorage;
  });
