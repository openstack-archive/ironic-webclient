/*
 * Copyright (c) 2015 Hewlett-Packard Enterprise Development Company, L.P.
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
 * Mock service override for the ui-router template factory, so that we can unit test components
 * without having to mock out the entire template loading mechanism.
 */
angular.module('template.mock', ['ui.router'])
  .run(function($templateFactory) {
    'use strict';

    // Spy on the fromUrl method, so we intercept all $http calls
    // to templates and don't fail on creating those.
    spyOn($templateFactory, 'fromUrl');
  });
