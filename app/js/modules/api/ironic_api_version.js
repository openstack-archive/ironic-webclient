/*
 * Copyright (c) 2015 Hewlett Packard Enterprise Development Company, L.P.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License'); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

/**
 * The current supported version of the ironic api. This version is hardcoded until a more
 * sophisticated version negotiation algorithm can be provided. The main blocker is that the
 * current APi abstraction library - ngResource - does not provide pre-flight modificiation of
 * requests via promise resolution. A patch has been provided
 * https://github.com/angular/angular.js/pull/13273; if accepted, this parameter will be
 * incorproated into the ironic_api_interceptor. If not, alternative libraries will have to be
 * evaluated.
 */
angular.module('ironic.api').constant('ironicApiVersion', function() {
  'use strict';
  return '1.14';
});
