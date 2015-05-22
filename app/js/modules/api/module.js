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
                    var resourceUrl = new URL(baseUri + '/' + resourceName +
                    '/:uuid');

                    // normalize the path
                    resourceUrl.pathname =
                        resourceUrl.pathname.replace('//', '/');

                    return $resource(resourceUrl.toString(),
                        {'uuid': '@uuid'}, {
                            query: {
                                method: 'GET',
                                isArray: true,
                                transformResponse: function (data) {
                                    var parsed = JSON.parse(data);
                                    return parsed[resourceName];
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
                        var r = getResource(resourceName);
                        return r.query.apply(r, arguments);
                    },
                    'create': function () {
                        var r = getResource(resourceName);
                        return r.create.apply(r, arguments);
                    },
                    'read': function () {
                        var r = getResource(resourceName);
                        return r.read.apply(r, arguments);
                    },
                    'update': function () {
                        var r = getResource(resourceName);
                        return r.update.apply(r, arguments);
                    },
                    'delete': function () {
                        var r = getResource(resourceName);
                        return r.delete.apply(r, arguments);
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
