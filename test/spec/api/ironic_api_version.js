/**
 * Unit tests for ironic's API Version Header.
 */
describe('Unit: OpenStack Ironic Version Header',
  function() {
    'use strict';

    var $httpBackend;

    // Load common configuration mocks.
    beforeEach(module('openstack.mock.$$selectedConfiguration'));

    // We are testing the ironic.api module.
    beforeEach(module('ironic.api'));

    beforeEach(inject(function($injector) {
      // Set up the mock http service
      $httpBackend = $injector.get('$httpBackend');
    }));

    afterEach(inject(function($$persistentStorage) {
      // Clear any config selections we've made.
      $$persistentStorage.remove('$$selectedConfiguration');

      // Assert no outstanding requests.
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    }));

    it('should exist',
      inject(function(ironicApiVersion) {
        expect(ironicApiVersion).toBeDefined();
      }));

    it('should return 1.14',
      inject(function(ironicApiVersion) {
        expect(ironicApiVersion()).toBe('1.14');
      }));

    it('should be attached to all ironic API requests',
      inject(function(IronicNode, IronicPort, IronicChassis, IronicDriver,
                      IronicDriverProperties) {
        var expectedHeaders = {
          "X-OpenStack-Ironic-API-Version": "1.14",
          "Accept": "application/json, text/plain, */*"
        };

        // Everything's a 404 response for simplicity's sake. We only care about the header.
        $httpBackend
          .expectGET('http://ironic.example.com:1000/nodes/fake',
          expectedHeaders)
          .respond(404, '');
        $httpBackend
          .expectGET('http://ironic.example.com:1000/ports/fake',
          expectedHeaders)
          .respond(404, '');
        $httpBackend
          .expectGET('http://ironic.example.com:1000/chassis/fake',
          expectedHeaders)
          .respond(404, '');
        $httpBackend
          .expectGET('http://ironic.example.com:1000/drivers/fake',
          expectedHeaders)
          .respond(404, '');
        $httpBackend
          .expectGET('http://ironic.example.com:1000/drivers/properties?driver_name=fake',
          expectedHeaders)
          .respond(404, '');

        IronicNode.read({'uuid': 'fake'});
        IronicPort.read({'uuid': 'fake'});
        IronicChassis.read({'uuid': 'fake'});
        IronicDriver.read({'uuid': 'fake'});
        IronicDriverProperties.read({'driver_name': 'fake'});

        $httpBackend.flush();

      }));

  });
