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
 * Form validator that will perform an asynchronous check to see if Ironic is
 * available at the provided url. It will expose a variable on the control to
 * which it is applied, with an array of detected API versions.
 */
angular.module('ironic.api').directive('ironicApiUrl',
    function ($q, $http) {
        'use strict';

        return {
            require: 'ngModel',
            link: function (scope, elm, attrs, ctrl) {

                ctrl.$ironicVersions = [];

                ctrl.$asyncValidators.ironicApiUrl =
                    function (modelValue) {
                        var def = $q.defer();

                        $http.get(modelValue).then(function (result) {
                            var name = result.data.name;

                            if (name !== 'OpenStack Ironic API') {
                                def.reject();
                            }

                            var versions = result.data.versions || [];
                            for (var i = 0; i < versions.length; i++) {
                                versions[i] = versions[i].id;
                            }
                            ctrl.$ironicVersions = versions;
                            def.resolve();
                        }, function () {
                            def.reject();
                        });

                        return def.promise;
                    };
            }
        };
    });
