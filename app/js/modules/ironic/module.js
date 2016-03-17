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
angular.module('ironic', ['ui.router', 'ui.bootstrap', 'ironic.util', 'ironic.api'])
  .config(function($urlRouterProvider, $httpProvider, $stateProvider, $$configurationProvider) {
    'use strict';

    // Default UI route
    $urlRouterProvider.otherwise('/ironic');

    // Enable all of our configuration detection methods
    $$configurationProvider.$enableDefault(true);
    $$configurationProvider.$enableConfigLoad(true);
    $$configurationProvider.$enableLocalStorage(true);

    // Ironic's root state, used to resolve global resources before
    // the application fully initializes.
    $stateProvider
      .state('root', {
        abstract: true,
        url: '',
        templateUrl: 'view/ironic/index.html'
      })
      .state('root.ironic', {
        url: '/ironic',
        views: {
          header: {
            templateUrl: 'view/ironic/header.html',
            controller: 'HeaderController as headerCtrl'
          },
          main: {
            templateUrl: 'view/ironic/node_list.html',
            controller: 'NodeListController as nodeListCtrl'
          }
        },
        resolve: {
          configurations: function($$configuration) {
            return $$configuration.query({}).$promise;
          },
          currentConfiguration: function($$selectedConfiguration, $q) {
            var deferred = $q.defer();

            var resource = $$selectedConfiguration.get();
            resource.$promise.then(
              function() {
                deferred.resolve(resource);
              },
              function() {
                deferred.reject('no_config');
              });
            return deferred.promise;
          }
        }
      })
      .state('root.ironic.nodes', {
        abstract: true,
        url: '/nodes'
      })
      .state('root.ironic.nodes.detail', {
        abstract: true,
        url: '/:uuid',
        resolve: {
          nodeUuid: function($stateParams) {
            return $stateParams.uuid;
          }
        },
        views: {
          'main@root': {
            templateUrl: 'view/ironic/detail.html',
            controller: 'NodeDetailController as nodeCtrl'
          }
        }
      })
      .state('root.ironic.nodes.detail.node', {
        url: '/node',
        templateUrl: 'view/ironic/detail_node.html'
      })
      .state('root.ironic.nodes.detail.ports', {
        url: '/ports',
        templateUrl: 'view/ironic/detail_ports.html',
        controller: 'NodeDetailPortsController as portCtrl'
      })
      .state('root.ironic.nodes.detail.driver', {
        url: '/driver',
        templateUrl: 'view/ironic/detail_driver.html',
        controller: 'NodeDetailDriverController as driverCtrl'
      })
      .state('root.config', {
        url: '/config',
        views: {
          main: {
            templateUrl: 'view/ironic/config.html',
            controller: 'ConfigurationController as ctrl'
          }
        }
      });
  })
  .run(function($rootScope, $state) {
    'use strict';

    var listener = $rootScope.$on('$stateChangeError',
      function(evt, toState, toParams, fromState, fromParams, reason) {
        if (reason === 'no_config') {
          $state.go('root.config');
        } else {
          $state.go('root.ironic');
        }
      });
    $rootScope.$on('$destroy', listener);
  });
