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
 * This module defines dependencies and root routes, but no actual
 * functionality.
 */
angular.module('ironic', ['ui.router', 'ui.bootstrap', 'ironic.chassis',
    'ironic.drivers', 'ironic.nodes', 'ironic.ports',
    'ironic.util', 'ironic.api'])
    .config(function ($urlRouterProvider, $httpProvider, $stateProvider) {
        'use strict';

        // Default UI route
        $urlRouterProvider.otherwise('/ironic');

        // Ironic's root state, used to resolve global resources before
        // the application fully initializes.
        $stateProvider
            .state('ironic', {
                url: '/ironic',
                views: {
                    '@': {
                        controller: 'ApplicationController',
                        templateUrl: 'view/ironic/index.html'
                    }
                },
                resolve: {
                    configuration: function ($$configuration) {
                        return $$configuration.resolveAll();
                    },
                    selectedConfiguration: function ($$configuration) {
                        return $$configuration.resolveSelected();
                    }
                }
            })
            .state('error', {
                url: '/error',
                abstract: true,
                templateUrl: 'view/ironic/error.html'
            })
            .state('error.no_configuration', {
                url: '/no_configuration',
                views: {
                    'main': {
                        controller: 'ConfigurationController',
                        templateUrl: 'view/ironic/error/no_configuration.html'
                    }
                },
                resolve: {
                    configuration: function ($$defaultConfiguration) {
                        return angular.copy($$defaultConfiguration);
                    },
                    assertNoConfiguration: function ($q, $$configuration,
                                                     $$errorCode) {
                        // Make sure we have an invalid configuration in case
                        // someone deep-links.
                        var deferred = $q.defer();
                        $$configuration.resolveSelected().then(
                            function () {
                                deferred.reject($$errorCode.HAS_CONFIGURATION);
                            },
                            function () {
                                deferred.resolve();
                            }
                        );
                        return deferred.promise;
                    }
                }
            });

        // Attach common request headers out of courtesy to the API
        $httpProvider.defaults.headers.common['X-Client'] = 'ironic-webclient';
    })
    .run(function ($rootScope, $$errorCode, $state, $log) {
        'use strict';

        $rootScope.$on('$stateChangeError',
            function (event, toState, toParams, fromState, fromParams,
                      error) {
                switch (error) {

                    // If route resolution indicates that no configuration was
                    // found, take the user to the no_configuration error
                    // state.
                    case $$errorCode.NO_CONFIGURATION:
                        $log.warn('No configuration found.');
                        event.preventDefault();
                        $state.go('error.no_configuration');
                        return;

                    // If the route resolution indicates that a configuration
                    // was found, take the user to the root state.
                    case $$errorCode.HAS_CONFIGURATION:
                        event.preventDefault();
                        $state.go('ironic');
                        return;
                }
            });
    });
