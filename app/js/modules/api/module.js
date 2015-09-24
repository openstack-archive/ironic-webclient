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
 * A module of resources that talk with the ironic API.
 */
angular.module('ironic.api', ['openstack', 'ngResource'])
  .config(function($$configurationProvider, $windowProvider) {
    'use strict';

    // Build a default ironic location from the $window provider
    var location = $windowProvider.$get().location;
    var apiRoot = location.protocol + '//' + location.hostname + ':6385';

    // This line registers ironic's default API root, as detected via the current hostname, with
    // the $$configurationProvider's default API detection mechanism.
    $$configurationProvider.$registerDefault('ironic', apiRoot);
  });
