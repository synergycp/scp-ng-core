(function () {
  'use strict';

  angular
    .module('scp.core.dashboard')
    .provider('Dashboard', makeDashboardProvider)
    ;

  var DEFAULT_PRIORITY = 100;

  /**
   * @ngInject
   */
  function makeDashboardProvider(_, EventEmitterProvider) {
    var DashboardProvider = {};
    var repos = [];

    DashboardProvider.$get = makeDashboardService;
    DashboardProvider.add = add;
    DashboardProvider.addWithPriority = addWithPriority;
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
      return addWithPriority(name, DEFAULT_PRIORITY);
    }

    function addWithPriority(name, priority) {
      repos.push({
        name: name,
        priority: priority,
      });

      DashboardProvider.fire('repo:add', name);

      return DashboardProvider;
    }

    function remove(name) {
      _.remove(repos, {name: name});
      DashboardProvider.fire('repo:remove', name);

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
        return _(repos)
          .sortBy(['priority'])
          .map(getRepo)
          .value();
      }

      function getRepo(repo) {
        return $injector.get(repo.name);
      }
    }
  }
})();
