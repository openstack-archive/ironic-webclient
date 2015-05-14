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
angular.module('ironic.api', ['openstack'])
    .config(function ($$resourceFactoryProvider) {
        'use strict';

        $$resourceFactoryProvider
            .$addServiceFactory('ironic', function ($resource) {
                return function (baseUri, resourceName) {
                    var resourceUrl = baseUri + resourceName + '/:uuid';

                    return $resource(resourceUrl, {'uuid': '@uuid'}, {
                        query: {
                            method: 'GET',
                            isArray: true,
                            transformResponse: function (data) {
                                return data[resourceName];
                            }
                        },
                        create: {
                            method: 'POST'
                        },
                        read: {
                            method: 'GET'
                        },
                        update: {
                            method: 'PUT'
                        },
                        delete: {
                            method: 'DELETE'
                        }
                    });
                };
            });
    })
    .config(function ($provide) {
        'use strict';

        function buildResource(resourceName) {

            return function ($$configuration, $$resourceFactory) {

                function getResource() {
                    var serviceName = 'ironic';
                    return $$resourceFactory.build(serviceName, resourceName);
                }

                return {
                    'query': function () {
                        return getResource(resourceName).query.call(arguments);
                    },
                    'create': function () {
                        return getResource(resourceName).create.call(arguments);
                    },
                    'read': function () {
                        return getResource(resourceName).read.call(arguments);
                    },
                    'update': function () {
                        return getResource(resourceName).update.call(arguments);
                    },
                    'delete': function () {
                        return getResource(resourceName).delete.call(arguments);
                    }
                };
            };
        }


        $provide.service('IronicChassis', buildResource('chassis'));
        $provide.service('IronicDriver', buildResource('drivers'));
        $provide.service('IronicNode', buildResource('nodes'));
        $provide.service('IronicPort', buildResource('ports'));
    }
);
