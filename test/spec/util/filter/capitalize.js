/*
 * Copyright (c) 2016 Hewlett Packard Enterprise Development Company, L.P.
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
 * Unit tests for the capitalization filter.
 */
describe('Filter: capitalize', function() {
  'use strict';

  var $filter;

  beforeEach(function () {
    module('ironic.util');

    inject(function (_$filter_) {
      $filter = _$filter_;
    });
  });

  it('should be able to uppercase an entire input',
    function() {
      expect($filter('capitalize')('hello')).toBe('Hello');
      expect($filter('capitalize')('hello world')).toBe('Hello World');
    });
});
