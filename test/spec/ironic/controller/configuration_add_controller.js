/**
 * Unit tests for the application root module.
 */
describe('Unit: Ironic-webclient Add-Configuration Controller',
  function() {
    'use strict';

    var $controller;
    var mockInjectionProperties = {
      $scope: {},
      $modalInstance: {
        close: function() {
        },
        dismiss: function() {
        }
      },
      configuration: [{id: 'test'}]
    };

    beforeEach(function() {
      // Load the ironic module.
      module('ironic');

      // Load the controller provider.
      inject(function(_$controller_) {
        $controller = _$controller_;
      });
    });

    describe('Controller Properties', function() {
      it('does not pollute the $scope', function() {
        var $scope = {};
        $controller('ConfigurationAddController', mockInjectionProperties);
        expect($scope).toEqual({});
      });

      it('sets the configuration property to the injected configuration',
        function() {
          var controller = $controller('ConfigurationAddController', mockInjectionProperties);
          expect(controller.configuration).toBe(mockInjectionProperties.configuration);
        });

      it('sets the newConfiguration property to a valid cloud configuration with an ironic apiBase',
        function() {
          var controller = $controller('ConfigurationAddController', mockInjectionProperties);
          expect(controller.newConfiguration.ironic).toEqual({'apiRoot': ''});
          expect(controller.newConfiguration.name).toBeDefined();
        });

      it('sets the $scope.location to a hash of the current URL',
        inject(function($location) {
          spyOn($location, 'host').and.returnValue('example.com');
          spyOn($location, 'protocol').and.returnValue('https');
          spyOn($location, 'port').and.returnValue(1234);

          var controller = $controller('ConfigurationAddController', mockInjectionProperties);
          expect(controller.location).toEqual({
            'host': 'example.com',
            'protocol': 'https',
            'port': 1234
          });
        }));
    });

    describe('$scope.close', function() {
      it('calls dismiss when close() is called.',
        function() {
          var spy = spyOn(mockInjectionProperties.$modalInstance, 'dismiss');
          var controller = $controller('ConfigurationAddController', mockInjectionProperties);
          controller.close();
          expect(spy).toHaveBeenCalled();
          expect(spy.calls.count()).toEqual(1);
        });
    });

    describe('$scope.save', function() {
      it('resolves the modal promise with a valid configuration when close() is called',
        function() {
          var spy = spyOn(mockInjectionProperties.$modalInstance, 'close');
          var controller = $controller('ConfigurationAddController', mockInjectionProperties);

          // Simulate form input
          controller.newConfiguration.name = 'Test Name';
          controller.save();
          expect(spy).toHaveBeenCalled();

          // The ID should have been automatically populated from the name, in order to ensure
          // the existence of a key.
          expect(spy.calls.mostRecent().args[0]).toEqual({
            id: 'Test Name',
            name: 'Test Name',
            ironic: {
              apiRoot: ''
            }
          });
        });
    });
  });
