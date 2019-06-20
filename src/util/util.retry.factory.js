(function () {
  'use strict';

  angular
    .module('scp.core.util')
    .factory('Retry', RetryFactory);

  /**
   * Retry Factory
   *
   * @ngInject
   */
  function RetryFactory ($q, $timeout) {
    return function (action) {
        return new Retry($q, $timeout, action);
    };
  }

  function Retry ($q, $timeout, action) {
    var retry = this;
    var _attempts, _interval = 0;

    retry.go = go;
    retry.attempts = attempts;
    retry.interval = interval;

    //////////

    function go() {
      return $q.when()
        .then(action)
        .catch(function (error) {
          console.log(error);
          if (_attempts !== undefined && _attempts-- <= 1) {
            throw error;
          }
          return go();
        });
    }

    function attempts(value) {
      _attempts = value;
      return retry;
    }

    function interval(value) {
      _interval = value;
      return retry;
    }
  }
})();
