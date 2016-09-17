(function () {
  'use strict';

  angular
    .module('scp.core.dashboard')
    .provider('Dashboard', makeDashboardProvider)
    ;

  /**
   * @ngInject
   */
  function makeDashboardProvider() {
    var DashboardProvider = {};
    var repos = [];

    DashboardProvider.$get = makeDashboardService;
    DashboardProvider.add = add;

    return DashboardProvider;

    /**
     * @ngInject
     */
    function makeDashboardService($injector) {
      return new DashboardService($injector);
    }

    function add(name) {
      repos.push(name);

      return DashboardProvider;
    }

    /**
     * Dashboard Service
     */
    function DashboardService ($injector) {
      var Dashboard = this;

      Dashboard.get = get;

      //////////

      function get() {
        return _.map(repos, $injector.get);
      }
    }
  }
})();
