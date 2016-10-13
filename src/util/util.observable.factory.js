(function () {
  'use strict';

  angular
    .module('scp.core.util')
    .factory('Observable', ObservableFactory);

  /**
   * Observable Factory
   *
   * @ngInject
   */
  function ObservableFactory (EventEmitter) {
    return function () {
        return new Observable(EventEmitter());
    };
  }

  function Observable (event) {
    var observable = this;
    var value;

    observable.get = get;
    observable.set = set;
    observable.fireChangeEvent = fireChangeEvent;

    event.bindTo(observable);

    //////////

    function get() {
      return value;
    }

    function set(val) {
      var changed = value != val;

      value = val;

      event.fire('set', value);
      (changed ? fireChangeEvent : angular.noop)();
    }

    function fireChangeEvent() {
      event.fire('change', value);
    }
  }
})();
