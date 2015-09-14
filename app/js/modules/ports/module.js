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
 * Port handling for the Ironic UI.
 */
angular.module('ironic.ports', ['ui.router', 'ui.bootstrap'])
  .config(function ($urlRouterProvider, $httpProvider, $stateProvider) {
    'use strict';

    $stateProvider
      .state('ironic.ports', {
        'url': '/ports',
        'views': {
          'main': {
            'templateUrl': 'view/ports/index.html',
            'controller': 'PortListController as ctrl'
          }
        }
      })
      .state('ironic.ports.detail', {
        'url': '/:uuid',
        'resolve': {
          'port': function (IronicPort, $stateParams) {
            return IronicPort.read({
              'uuid': $stateParams.uuid
            }).$promise;
          }
        },
        'views': {
          'main@ironic': {
            'templateUrl': 'view/ports/detail.html',
            'controller': 'PortDetailController as ctrl'
          }
        }
      });
  })
  .controller('PortListController', function ($scope, IronicPort) {
    'use strict';
    var vm = this;

    vm.ports = IronicPort.query({});
  })
  .controller('PortDetailController', function ($scope, port) {
    'use strict';
    var vm = this;

    vm.port = port;
  });

