/**
 * Unit tests for ironic's ngResource IronicNode implementation.
 */
describe('Unit: OpenStack Ironic Node Resource',
  function() {
    'use strict';

    var $rootScope;

    // We are testing the ironic.api module.
    beforeEach(module('ironic.api'));

    beforeEach(inject(function($injector) {
      // Set up the mock http service
      $rootScope = $injector.get('$rootScope');
    }));

    /**
     * Assertion helper, make sure a list of transitions contains one we're looking for.
     *
     * @param {Array} transitions The transitions array to check.
     * @param {String} from The name of the originating state.
     * @param {String} actor The name of the actor.
     * @param {String} action The name of the transition action name.
     * @param {String} target The name of the target state.
     * @return {void}
     */
    function assertHasTransition (transitions, from, actor, action, target) {
      expect(transitions).toContain({
        from_state: from,
        event: action,
        target_state: target,
        actor: actor
      });
    }

    it('should implement the query method',
      inject(function(IronicNodePowerTransition) {
        expect(IronicNodePowerTransition.query).toBeDefined();

        // CRUD methods not supported on this resource.
        expect(IronicNodePowerTransition.create).not.toBeDefined();
        expect(IronicNodePowerTransition.read).not.toBeDefined();
        expect(IronicNodePowerTransition.update).not.toBeDefined();
        expect(IronicNodePowerTransition.remove).not.toBeDefined();
      }));

    it('should return a "resource-like" array"',
      inject(function(IronicNodePowerTransition) {
        var transitions = IronicNodePowerTransition.query();
        $rootScope.$apply();
        expect(transitions.$resolved).toBeTruthy();
        expect(transitions.$promise.$$state.status).toBe(1);
      }));

    it('should permit filtering.',
      inject(function(IronicNodePowerTransition) {
        var transitions = IronicNodePowerTransition.query({
          from_state: 'power on'
        });
        $rootScope.$apply();

        expect(transitions.length).toEqual(2);

        var conductorTransitions = IronicNodePowerTransition.query({
          from_state: 'rebooting',
          actor: 'conductor'
        });
        $rootScope.$apply();

        expect(conductorTransitions.length).toEqual(1);
      }));

    it('should permit query promise handlers.',
      inject(function(IronicNodePowerTransition) {
        var success = false;
        IronicNodePowerTransition.query({
          from_state: 'power on'
        }, function() {
          success = true;
        });
        $rootScope.$apply();

        expect(success).toBeTruthy();
      }));

    it('should return the expected transition graph.',
      inject(function(IronicNodePowerTransition) {
        var transitions = IronicNodePowerTransition.query();
        $rootScope.$apply();

        var USER = "user";
        var CONDUCTOR = "conductor";

        // Power states
        assertHasTransition(transitions, "power off", USER, "power on", "power on");
        assertHasTransition(transitions, "power on", USER, "power off", "power off");
        assertHasTransition(transitions, "power on", USER, "reboot", "rebooting");
        assertHasTransition(transitions, "rebooting", CONDUCTOR, "power on", "power on");
      }));
  });
