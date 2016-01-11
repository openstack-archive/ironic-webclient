/**
 * Unit tests for ironic's ngResource IronicNode implementation.
 */
describe('Unit: OpenStack Ironic Node Resource',
  function() {
    'use strict';

    // We are testing the ironic.api module.
    beforeEach(module('ironic.api'));

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
        "from": from,
        "event": action,
        "target": target,
        "actor": actor
      });
    }

    it('should implement the query method',
      inject(function(IronicNodeTransition) {
        expect(IronicNodeTransition.query).toBeDefined();

        // CRUD methods not supported on this resource.
        expect(IronicNodeTransition.create).not.toBeDefined();
        expect(IronicNodeTransition.read).not.toBeDefined();
        expect(IronicNodeTransition.update).not.toBeDefined();
        expect(IronicNodeTransition.remove).not.toBeDefined();
      }));

    it('should return a "resource-like" array"',
      inject(function(IronicNodeTransition) {

        var transitions = IronicNodeTransition.query();
        expect(transitions.$resolved).toBeTruthy();
        expect(transitions.$promise.$$state.status).toBe(1);
      }));

    it('should return the expected transition graph.',
      inject(function(IronicNodeTransition) {
        var transitions = IronicNodeTransition.query();

        var USER = "user";
        var CONDUCTOR = "conductor";

        // ENROLL state
        assertHasTransition(transitions, "enroll", USER, "manage", "verifying");

        // VERIFYING state
        assertHasTransition(transitions, "verifying", CONDUCTOR, "done", "manageable");
        assertHasTransition(transitions, "verifying", CONDUCTOR, "fail", "enroll");

        // MANAGEABLE state
        assertHasTransition(transitions, "manageable", USER, "provide", "cleaning");
        assertHasTransition(transitions, "manageable", USER, "clean", "cleaning");
        assertHasTransition(transitions, "manageable", USER, "inspect", "inspecting");

        // INSPECTING state
        assertHasTransition(transitions, "inspecting", CONDUCTOR, "done", "manageable");
        assertHasTransition(transitions, "inspecting", CONDUCTOR, "fail", "inspect failed");

        // INSPECT FAILED state
        assertHasTransition(transitions, "inspect failed", USER, "inspect", "inspecting");
        assertHasTransition(transitions, "inspect failed", USER, "manage", "manageable");

        // CLEANING state
        assertHasTransition(transitions, "cleaning", CONDUCTOR, "manage", "manageable");
        assertHasTransition(transitions, "cleaning", CONDUCTOR, "wait", "clean wait");
        assertHasTransition(transitions, "cleaning", CONDUCTOR, "fail", "clean failed");
        assertHasTransition(transitions, "cleaning", CONDUCTOR, "done", "available");

        // CLEAN WAIT state
        assertHasTransition(transitions, "clean wait", CONDUCTOR, "resume", "cleaning");
        assertHasTransition(transitions, "clean wait", CONDUCTOR, "abort", "clean failed");
        assertHasTransition(transitions, "clean wait", CONDUCTOR, "fail", "clean failed");

        // CLEAN FAILED state
        assertHasTransition(transitions, "clean failed", USER, "manage", "manageable");

        // AVAILABLE state
        assertHasTransition(transitions, "available", USER, "manage", "manageable");
        assertHasTransition(transitions, "available", USER, "deploy", "deploying");

        // DEPLOYING state
        assertHasTransition(transitions, "deploying", CONDUCTOR, "wait", "wait call-back");
        assertHasTransition(transitions, "deploying", CONDUCTOR, "done", "active");
        assertHasTransition(transitions, "deploying", CONDUCTOR, "fail", "deploy failed");

        // ACTIVE state
        assertHasTransition(transitions, "active", USER, "rebuild", "deploying");
        assertHasTransition(transitions, "active", USER, "delete", "deleting");

        // DEPLOY FAILED state
        assertHasTransition(transitions, "deploy failed", USER, "rebuild", "deploying");
        assertHasTransition(transitions, "deploy failed", USER, "deploy", "deploying");
        assertHasTransition(transitions, "deploy failed", USER, "delete", "deleting");

        // WAIT CALL_BACK state
        assertHasTransition(transitions, "wait call-back", CONDUCTOR, "resume", "deploying");
        assertHasTransition(transitions, "wait call-back", CONDUCTOR, "delete", "deleting");

        // DELETING state
        assertHasTransition(transitions, "deleting", CONDUCTOR, "error", "error");
        assertHasTransition(transitions, "deleting", CONDUCTOR, "clean", "cleaning");

        // ERROR state
        assertHasTransition(transitions, "error", USER, "delete", "deleting");
        assertHasTransition(transitions, "error", USER, "rebuild", "deploying");
      }));
  });
