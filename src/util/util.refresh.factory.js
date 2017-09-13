(function () {
  'use strict';

  angular
    .module('scp.core.util')
    .factory('Refresh', RefreshFactory);

  /**
   * Refresh Factory
   *
   * @ngInject
   */
  function RefreshFactory ($interval) {
    return function (callback) {
        return new Refresh(callback, $interval);
    };
  }

  function Refresh (callback, $interval) {
    var refresh = this;
    var interval;

    refresh.now = now;
    refresh.every = every;
    refresh.stop = stop;
    refresh.limitScope = limitScope;

    //////////

    function now() {
      callback({
        auto: false,
      });

      return refresh;
    }

    function every(ms) {
      if (interval) {
        refresh.stop();
      }

      if (ms) {
        interval = $interval(function() {
          callback({
            auto: true,
          });
        }, ms);
      }

      return refresh;
    }

    function stop() {
      $interval.cancel(interval);

      return refresh;
    }

    function limitScope($scope) {
      $scope.$on('$destroy', refresh.stop);

      return refresh;
    }
  }
})();
