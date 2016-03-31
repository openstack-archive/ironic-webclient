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
 * Unit tests for the unknown action modal controller.
 */
describe('Unit: Ironic-webclient UnknownActionModalController',
  function() {
    'use strict';

    var $controller;
    var mockInjectionProperties = {
      $scope: {},
      $uibModalInstance: {
        close: function() {
        },
        dismiss: function() {
        }
      },
      actionName: 'test'
    };

    beforeEach(function() {
      module('template.mock');
      module('ironic');
    });

    beforeEach(inject(function(_$controller_) {
      $controller = _$controller_;
    }));

    describe('Controller Properties', function() {
      it('does not pollute the $scope',
        function() {
          $controller('UnknownActionModalController', mockInjectionProperties);
          expect(mockInjectionProperties.$scope).toEqual({});
        });
    });

    describe('Controller Initialization', function() {

      it('passes the actionName to the controller scope',
        function() {
          var controller = $controller('UnknownActionModalController', mockInjectionProperties);
          expect(controller.actionName).toEqual('test');
        });
    });

    describe('$scope.close', function() {
      it('calls dismiss when close() is called.',
        function() {
          var spy = spyOn(mockInjectionProperties.$uibModalInstance, 'dismiss');
          var controller = $controller('UnknownActionModalController', mockInjectionProperties);

          controller.close();
          expect(spy).toHaveBeenCalled();
          expect(spy.calls.count()).toEqual(1);
        });
    });
  });
