(function () {
  'use strict';

  angular
    .module('scp.core.search')
    .service('Search', SearchService)
    ;

  /**
   * Search Service
   *
   * @ngInject
   */
  function SearchService (EventEmitter, $state, $stateParams, $q) {
    var Search = this;
    var event = EventEmitter();

    Search.go = go;
    Search.tab = {
      items: [],
      add: addTab,
      loadAll: loadAllTabs,
    };

    event.bindTo(Search);
    event.on('change', syncQuery);
    event.on('tab.add', syncTab);

    //////////

    function go(search) {
      if (typeof search !== 'undefined') {
        Search.query = search;
      }

      event.fire('change', Search.query);
    }

    function syncQuery() {
      _.map(Search.tab.items, syncTab);
    }

    function addTab(tab) {
      Search.tab.items.push(tab);

      event.fire('tab.add', tab);
    }

    function syncTab(tab) {
      tab.list.filter({
        q: Search.query,
      });
    }

    function loadAllTabs() {
      return $q.all(
        _.map(Search.tab.items, function (tab) {
          return tab.list.load();
        })
      );
    }
  }
})();
