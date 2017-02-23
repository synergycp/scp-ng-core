(function () {
  'use strict';

  angular
    .module('scp.core.util')
    .provider('EventEmitter', makeEventEmitterProvider)
  ;

  function makeEventEmitterProvider(_) {
    var EventEmitterProvider = {};

    EventEmitterProvider.make = makeEventEmitter;
    EventEmitterProvider.$get = makeEventEmitterFactory;

    return EventEmitterProvider;

    /**
     * @ngInject
     */
    function makeEventEmitterFactory() {
      return makeEventEmitter;
    }

    function makeEventEmitter() {
      return new EventEmitter(_);
    }
  }

  function EventEmitter (_) {
    var event = this;

    event.callbacks = {};
    event.on = on;
    event.fire = fire;
    event.bindTo = bindTo;

    //////////

    function on(name, callback) {
      var names = angular.isArray(name) ? name : [name];
      _.each(names, function (name) {
        var cbs = event.callbacks[name] = event.callbacks[name] || [];

        cbs.push(callback);
      });

      return event;
    }

    function fire(name) {
      var args = [].splice.call(arguments, 1);
      _.each(event.callbacks[name] || [], function (cb) {
        cb.apply(cb, args);
      });
    }

    function bindTo(target) {
      target.on = _on;
      target.fire = _fire;

      function _on() {
        event.on.apply(event, arguments);

        return target;
      }

      function _fire() {
        event.fire.apply(event, arguments);

        return target;
      }

      return event;
    }
  }
})();
