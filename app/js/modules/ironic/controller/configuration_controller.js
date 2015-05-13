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
 * This controller allows the management of all the cloud configuration entries.
 */
angular.module('ironic').controller('ConfigurationController',
    function ($scope, $state, $location, defaultConfiguration,
              $$configuration, localConfig, autoConfig,
              fileConfig) {
        'use strict';

        $scope.hasConfig =
            localConfig.length + autoConfig.length + fileConfig.length > 0;

        $scope.localConfig = localConfig;
        $scope.autoConfig = autoConfig;
        $scope.fileConfig = fileConfig;

        $scope.location = {
            'host': $location.host(),
            'protocol': $location.protocol(),
            'port': $location.port()
        };

        $scope.add = function () {
            $$configuration.add().then(
                function () {
                    $$configuration.resolveLocal().then(function (configs) {
                        $scope.localConfig = configs;
                    });
                }
            );
        };

        $scope.remove = function (config) {
            $$configuration.remove(config);
            $$configuration.resolveLocal().then(function (configs) {
                $scope.localConfig = configs;
            });
        };
    });
