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
 * The Ironic Root Application.
 *
 * This module defines dependencies, but no actual functionality.
 */
angular.module('ironic', ['ui.router', 'ui.bootstrap', 'ironic.chassis',
    'ironic.configure', 'ironic.drivers', 'ironic.nodes', 'ironic.ports',
    'ironic.util'])
    .config(function ($urlRouterProvider, $httpProvider, $stateProvider) {
        'use strict';

        // Default UI route
        $urlRouterProvider.otherwise('/ironic');

        // Attach common request headers out of courtesy to the API
        $httpProvider.defaults.headers.common['X-Client'] = 'ironic-webclient';

        // Ironic's root state, used to resolve global resources before
        // the application fully initializes.
        $stateProvider
            .state('ironic', {
                url: '/ironic',
                views: {
                    '@': {
                        templateUrl: 'view/index.html'
                    }
                }
            });
    });