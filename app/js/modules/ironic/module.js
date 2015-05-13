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
                    selectedConfiguration: function ($$configuration) {
                        return $$configuration.resolveSelected();
                    },
                    /**
                     * Warning! This hack is in place to ensure that the
                     * selectedConfiguration - which asserts that at least one
                     * configuration exists, executes before the below
                     * configuration.
                     */
                    configuration: function (selectedConfiguration,
                                             $$configuration) {
                        return $$configuration.resolveAll();
                    }
                }
            })
            .state('config', {
                url: '/config',
                templateUrl: 'view/ironic/config.html',
                controller: 'ConfigurationController',
                resolve: {
                    defaultConfiguration: function ($$defaultConfiguration) {
                        return $$defaultConfiguration;
                    },
                    localConfig: function ($$configuration) {
                        return $$configuration.resolveLocal();
                    },
                    autoConfig: function ($$configuration) {
                        return $$configuration.resolveAutodetection();
                    },
                    fileConfig: function ($$configuration) {
                        return $$configuration.resolveConfigured();
                    }
                }
            });

        // Attach common request headers out of courtesy to the API
        $httpProvider.defaults.headers.common['X-Client'] = 'ironic-webclient';
    })
    .run(function ($rootScope, $state) {
        'use strict';

        $rootScope.$on('$stateChangeError',
            function () {
                $state.go('ironic');
            });
    });
