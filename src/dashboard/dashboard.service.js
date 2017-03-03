(function () {
  'use strict';

  angular
    .module('scp.core.dashboard')
    .provider('Dashboard', makeDashboardProvider)
    ;

  /**
   * @ngInject
   */
  function makeDashboardProvider(EventEmitterProvider) {
    var DashboardProvider = {};
    var repos = [];

    DashboardProvider.$get = makeDashboardService;
    DashboardProvider.add = add;
    DashboardProvider.remove = remove;
    DashboardProvider.repos = repos;
    EventEmitterProvider.make().bindTo(DashboardProvider);

    return DashboardProvider;

    /**
     * @ngInject
     */
    function makeDashboardService($injector) {
      return new DashboardService($injector);
    }

    function add(name) {
      repos.push(name);
      DashboardProvider.fire('repo:add', name);

      return DashboardProvider;
    }

    function remove(name) {
      var index = repos.indexOf(name);
      if (index !== -1) {
        repos.splice(index, 1);
        DashboardProvider.fire('repo:remove', name);
      }

      return DashboardProvider;
    }

    /**
     * Dashboard Service
     */
    function DashboardService ($injector) {
      var Dashboard = this;

      Dashboard.get = get;
      Dashboard.add = DashboardProvider.add;
      Dashboard.remove = DashboardProvider.remove;
      Dashboard.provider = DashboardProvider;
      Dashboard.provider.getRepo = getRepo;

      //////////

      function get() {
        var result = [];
        for (var i in repos) {
          result.push(
            getRepo(repos[i])
          );
        }
        return result;
      }

      function getRepo(name) {
        return $injector.get(name);
      }
    }
  }
})();
